import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { getSessionUser, createClient } from '@/lib/supabase/server';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function cleanJson(raw: string): string {
  // Strip markdown fences and any text before the first {
  const fenced = raw.replace(/```json|```/gi, '').trim();
  const start = fenced.indexOf('{');
  const end = fenced.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  return fenced.slice(start, end + 1);
}

/**
 * Pure regex destination extraction — no AI needed.
 * Handles: "plan a trip to Ooty", "I want to visit Delhi for 5 days",
 * "Goa itinerary", "take me to Munnar", "show me Jaipur", etc.
 */
function extractFromMessage(message: string): { destination: string; duration: number } {
  const text = message.trim();

  // Extract duration first
  const durationMatch = text.match(/(\d+)\s*(?:day|days|night|nights)/i);
  const duration = durationMatch ? Math.min(Math.max(parseInt(durationMatch[1], 10), 1), 5) : 3;

  // Destination extraction patterns — ordered by specificity
  const patterns = [
    // "trip to X", "travel to X", "visit X", "go to X", "going to X", "plan X"
    /(?:trip|travel|visit|going|go|plan(?:ning)?|journey|tour|itinerary)\s+(?:to|in|at|for|through|around)\s+([A-Za-z][\w\s]{1,30}?)(?:\s+for|\s+in|\s+\d|$|\?|\.)/i,
    // "to X" at start or after "want"
    /(?:want\s+to\s+(?:go\s+to|visit)|take\s+me\s+to|show\s+me)\s+([A-Za-z][\w\s]{1,25}?)(?:\s+for|\s+\d|$|\?|\.)/i,
    // plain "X trip" or "X tour" or "X itinerary"
    /^([A-Za-z][\w\s]{1,25}?)\s+(?:trip|tour|itinerary|travel|holiday|vacation)/i,
    // "in X" with capital
    /\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/,
    // bare capitalized word (last resort)
    /\b([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+)?)\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const dest = match[1].trim().replace(/\s+for$|\s+in$/, '').trim();
      if (dest.length >= 2) return { destination: dest, duration };
    }
  }

  // Absolute fallback: last multi-char word
  const words = text.split(/\s+/).filter(w => w.length > 2);
  return { destination: words[words.length - 1] || text, duration };
}

// ─── Strict DB matching — exact-first to avoid cross-city confusion ───────────
function findDestinationMatch(
  allDests: { id: string; slug: string; title: string }[],
  querySlug: string,
  queryName: string
) {
  const q = querySlug.toLowerCase();
  const name = queryName.toLowerCase();

  let match = allDests.find(d => d.slug.toLowerCase() === q);
  if (match) return match;

  match = allDests.find(d => d.slug.length >= 4 && q.startsWith(d.slug.toLowerCase()));
  if (match) return match;

  match = allDests.find(d => q.length >= 4 && d.slug.toLowerCase().startsWith(q));
  if (match) return match;

  match = allDests.find(d => d.title.toLowerCase() === name);
  if (match) return match;

  return null;
}

// ─── Ollama itinerary generation ─────────────────────────────────────────────
async function generateItinerary(
  destination: string,
  days: number,
  budget: string
): Promise<{ title: string; timeline: any[] }> {
  const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:3b';

  const budgetNote: Record<string, string> = {
    Explorer: 'budget stays, street food, local buses, and affordable sightseeing',
    Elite: '4-star hotels, private guides, fine dining, and sedan transfers',
    Royal: '5-star luxury, helicopter rides, VIP monument access, and Michelin dining',
  };

  // Generate exactly (days * 3) entries
  const totalEntries = days * 3;
  const exampleEntries = Array.from({ length: Math.min(days, 2) }, (_, d) =>
    ['Morning', 'Afternoon', 'Evening'].map((t, i) => JSON.stringify({
      day_number: d + 1,
      time_label: `Day ${d + 1} - ${t}`,
      title: `[Real place in ${destination}]`,
      description: `[1-2 sentences about this real place and what to do there]`
    })).join(',\n    ')
  ).join(',\n    ');

  const systemPrompt = `You are an expert travel curator. You have deep knowledge of real tourist destinations, landmarks, restaurants, markets, viewpoints, and cultural sites worldwide.

TASK: Create a ${days}-day ${budget} travel itinerary for ${destination}.

STRICT RULES:
1. Use ONLY real, named places that actually exist in or near ${destination}. Examples for Indian cities:
   - Delhi: India Gate, Qutub Minar, Humayun's Tomb, Chandni Chowk, Lodi Garden, Akshardham Temple
   - Ooty: Government Botanical Gardens, Doddabetta Peak, Ooty Lake, Rose Garden, Nilgiri Mountain Railway
   - Goa: Baga Beach, Dudhsagar Falls, Basilica of Bom Jesus, Anjuna Flea Market, Fort Aguada
   - Mumbai: Gateway of India, Marine Drive, Elephanta Caves, Dharavi, Crawford Market
   - Jaipur: Amber Fort, Hawa Mahal, City Palace, Jantar Mantar, Nahargarh Fort
2. DO NOT use generic names like "Local Restaurant", "Famous Temple", "Nearby Beach", "Popular Market".
3. Budget tier: ${budget} — focus on ${budgetNote[budget] || budgetNote.Explorer}.
4. Each activity needs: title (real place name + activity), description (2 vivid sentences mentioning the real place).
5. Output EXACTLY ${totalEntries} timeline entries: 3 per day, Morning/Afternoon/Evening for each of ${days} days.
6. time_label format must be EXACTLY: "Day X - Morning", "Day X - Afternoon", "Day X - Evening"

OUTPUT: Valid JSON only. No markdown, no explanation, no text outside the JSON.`;

  const userMessage = `Generate the ${days}-day ${budget} itinerary for ${destination} now. Output valid JSON:
{
  "title": "evocative title for the ${destination} trip",
  "timeline": [
    {
      "day_number": 1,
      "time_label": "Day 1 - Morning",
      "title": "Real Activity at Real Named Place",
      "description": "Two vivid sentences describing what to do at this real place."
    }
  ]
}`;

  const response = await fetch(`${ollamaHost}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ollamaModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 2048,
      },
      format: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          timeline: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day_number: { type: 'integer' },
                time_label: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['day_number', 'time_label', 'title', 'description'],
            },
          },
        },
        required: ['title', 'timeline'],
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.message?.content || '';
  if (!raw.trim()) throw new Error('Ollama returned an empty response');

  return JSON.parse(cleanJson(raw));
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return fail('Unauthorized. Please sign in.', 401);

    const { message, budget = 'Explorer' } = await request.json();
    if (!message || typeof message !== 'string') {
      return fail('Invalid request payload. Prompt message is required.', 400);
    }

    // ── Step 1: Pure regex extraction — fast, 100% reliable ───────────────
    const { destination, duration } = extractFromMessage(message);
    console.log(`[Planner] Extracted → "${destination}", ${duration} days`);

    // ── Step 2A: Check database for seeded itinerary ───────────────────────
    const slug = slugify(destination);
    const supabase = await createClient();
    const { data: allDests, error: dbErr } = await supabase
      .from('destinations')
      .select('id, slug, title');

    let matchedDest = null;
    if (allDests && !dbErr) {
      matchedDest = findDestinationMatch(allDests, slug, destination);
    }

    // ── Step 2B: DB match → return slug, frontend fetches seeded itinerary ─
    if (matchedDest) {
      console.log(`[Planner] DB hit → "${matchedDest.slug}"`);
      return ok({
        isCustom: false,
        destination,
        slug: matchedDest.slug,
        duration,
        title: matchedDest.title,
        timeline: [],
      });
    }

    // ── Step 2C: No DB match → generate real itinerary via Ollama ─────────
    console.log(`[Planner] No DB match — generating via Ollama for "${destination}"`);

    let itineraryData: { title: string; timeline: any[] };
    try {
      itineraryData = await generateItinerary(destination, duration, budget);
    } catch (genErr: any) {
      console.error('[Planner] Ollama generation failed:', genErr.message);
      return fail(`Failed to generate itinerary: ${genErr.message}`, 500);
    }

    return ok({
      isCustom: true,
      destination,
      slug: null,
      duration,
      title: itineraryData.title || `${destination} Explorer`,
      timeline: itineraryData.timeline || [],
    });

  } catch (err: any) {
    console.error('POST /api/planner/chat error:', err);
    return fail(err.message || 'Failed to process planner query.', 500);
  }
}
