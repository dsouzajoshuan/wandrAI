import { NextRequest } from 'next/server';
import { createClient, getSessionUser } from '@/lib/supabase/server';
import { ok, fail } from '@/lib/api-response';
import { generateOllamaResponse } from '@/lib/ollama';
import { orchestratorAiSchema } from '@/lib/validation/chat';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail('Unauthorized. Please sign in.', 401);
    }

    const body = await request.json();
    const result = orchestratorAiSchema.safeParse(body);

    if (!result.success) {
      return fail(result.error.format(), 400);
    }

    const { message, trip_id, history = [] } = result.data;
    const supabase = await createClient();

    // 1. Fetch trip and verify ownership (along with destination details)
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*, destinations(*)')
      .eq('id', trip_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (tripError) {
      throw tripError;
    }
    if (!trip) {
      return fail('Trip not found or access denied.', 404);
    }

    // 2. Fetch bookings for this trip
    const { data: bookings, error: bookingsError } = await supabase
      .from('trip_bookings')
      .select('*')
      .eq('trip_id', trip_id);

    if (bookingsError) {
      throw bookingsError;
    }

    // 3. Build Orchestrator System Prompt
    const destinationName = trip.destinations?.title || 'Unknown';
    const destinationCountry = trip.destinations?.country || 'Unknown';
    
    const bookingsContext = (bookings || []).map((b: any, idx: number) => {
      return `${idx + 1}. [${b.type.toUpperCase()}] ${b.name} (Time: ${b.scheduled_time || 'N/A'}, Status: ${b.status}, Ref: ${b.provider_ref || 'N/A'}, Location: ${b.lat || 'N/A'}, ${b.lng || 'N/A'})`;
    }).join('\n');

    const systemPrompt = `You are the Wandr AI Orchestrator — an elite digital concierge specialized in travel logistics, scheduling, and live booking coordination.

You are assisting the user with their trip to ${destinationName}, ${destinationCountry}.
Trip Details:
- Start Date: ${trip.start_date}
- Duration: ${trip.duration_days} days
- Status: ${trip.status}

Here is the current booking status (including hotels, cruises, dining, excursions):
${bookingsContext || 'No bookings currently scheduled.'}

Your Job:
1. Help the user plan, adjust, and review their bookings.
2. Confirm logistics, suggest schedules, or coordinate booking references (e.g. provider_ref).
3. If they want to add/remove something, provide suggestions matching their luxury profile.
4. Keep the voice elegant, premium, reassuring, and details-oriented. Never fabricate statuses.`;

    // 4. Call Ollama
    const reply = await generateOllamaResponse(systemPrompt, history, message);

    // 5. Log turns
    const { error: logError } = await supabase
      .from('ai_chat_logs')
      .insert([
        { user_id: user.id, context: 'orchestrator', role: 'user', content: message },
        { user_id: user.id, context: 'orchestrator', role: 'assistant', content: reply }
      ]);

    if (logError) {
      console.warn('Failed to log orchestrator chat turns:', logError);
    }

    return ok({ reply });
  } catch (err: any) {
    console.error('POST /api/orchestrator/ai error:', err);
    return fail(err.message || 'Failed to process orchestrator request.', 500);
  }
}
