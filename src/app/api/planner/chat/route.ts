import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/api-response';
import { generateOllamaResponse } from '@/lib/ollama';
import { getSessionUser } from '@/lib/supabase/server';

const PLANNER_PARSER_PROMPT = `You are a travel coordinator assistant for Wandr AI.
Your job is to analyze the user's travel request and extract the destination, duration, and optionally generate an itinerary.

The database has these pre-defined (seeded) destinations:
- ziro (Ziro Valley, India)
- spiti (Spiti Valley, India)
- meghalaya (Cherrapunji & Shillong, Meghalaya, India)
- hampi (Hampi Heritage Ruins, India)
- ladakh (Leh Wilderness, Ladakh, India)
- munnar (Munnar Valleys, India)
- santorini (Santorini, Greece)

Examine the user's message.
1. Check if the user is asking for one of the pre-defined destinations.
   - If they are, extract the slug (one of: ziro, spiti, meghalaya, hampi, ladakh, munnar, santorini).
   - Set "isCustom" to false.
2. If the user is asking for any other location (e.g. Paris, Tokyo, Bali) or a general custom request:
   - Set "isCustom" to true.
   - Generate a custom day-by-day itinerary timeline for the destination. Make sure it matches the requested number of days (default to 3 if not specified, maximum of 5 days). Include 3 activities per day (Morning, Afternoon, Evening).
3. Extract the duration of the trip (default to 3 if not specified, max 5).

Respond ONLY with a valid JSON object. Do NOT include any markdown code blocks, explanation text, or backticks around the JSON. The JSON schema must be exactly:
{
  "isCustom": boolean,
  "slug": "ziro" | "spiti" | "meghalaya" | "hampi" | "ladakh" | "munnar" | "santorini" | null,
  "duration": number,
  "title": "Trip Title (e.g. Munnar Cloud Valleys or Paris Romance)",
  "timeline": [
    {
      "day_number": number,
      "time_label": "Day X - Morning" | "Day X - Afternoon" | "Day X - Evening",
      "title": "Activity Title",
      "description": "Activity Description"
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail('Unauthorized. Please sign in.', 401);
    }

    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return fail('Invalid request payload. Prompt message is required.', 400);
    }

    let responseText = await generateOllamaResponse(PLANNER_PARSER_PROMPT, [], message);
    
    // Clean up potential markdown formatting from Ollama
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
      const parsedData = JSON.parse(responseText);
      return ok(parsedData);
    } catch (parseErr) {
      console.error('Failed to parse Ollama response as JSON:', responseText, parseErr);
      return fail('Failed to parse structured planner response from AI model.', 500);
    }
  } catch (err: any) {
    console.error('POST /api/planner/chat error:', err);
    return fail(err.message || 'Failed to process planner query.', 500);
  }
}
