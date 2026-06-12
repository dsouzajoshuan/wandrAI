import { NextRequest } from 'next/server';
import { createClient, getSessionUser } from '@/lib/supabase/server';
import { ok, fail } from '@/lib/api-response';
import { generateOllamaResponse } from '@/lib/ollama';
import { companionAiSchema } from '@/lib/validation/chat';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail('Unauthorized. Please sign in.', 401);
    }

    const body = await request.json();
    const result = companionAiSchema.safeParse(body);

    if (!result.success) {
      return fail(result.error.format(), 400);
    }

    const { message, companion_id, history = [] } = result.data;
    const supabase = await createClient();

    let systemPrompt = '';

    if (companion_id) {
      // Fetch companion details using the companion_profiles view
      const { data: companion, error: compError } = await supabase
        .from('companion_profiles')
        .select('*')
        .eq('id', companion_id)
        .maybeSingle();

      if (compError) {
        throw compError;
      }

      if (companion) {
        const interestsStr = (companion.interests || []).join(', ');
        const tagsStr = (companion.tags || []).join(', ');
        
        systemPrompt = `You are ${companion.full_name || 'a fellow traveler'}, a verified travel companion on Wandr AI.
Your specialty is: ${companion.specialty || 'General Travel'}.
Your bio: "${companion.bio || 'Wandering the world and seeking new views.'}"
Your interests: ${interestsStr || 'various outdoor and cultural activities'}.
Your tags: ${tagsStr || 'N/A'}.
Your availability: ${companion.availability_status}.

Act and chat exactly as ${companion.full_name || 'this traveler'}. Keep the responses natural, conversational, friendly, and adventurous. Refer to your bio and interests when relevant. Do not act like an AI assistant.`;
      }
    }

    if (!systemPrompt) {
      systemPrompt = `You are the Wandr Match AI Guide — a warm, friendly matchmaking advisor designed to connect solo travelers.
Your role is to help users find suitable companions, answer queries about companion compatibility, suggest creative icebreakers, and recommend safety practices during meetups. Keep your tone encouraging, approachable, and adventurous.`;
    }

    // Call Ollama
    const reply = await generateOllamaResponse(systemPrompt, history, message);

    // Log turns
    const { error: logError } = await supabase
      .from('ai_chat_logs')
      .insert([
        { user_id: user.id, context: 'companion_ai', role: 'user', content: message },
        { user_id: user.id, context: 'companion_ai', role: 'assistant', content: reply }
      ]);

    if (logError) {
      console.warn('Failed to log companion AI chat turns:', logError);
    }

    return ok({ reply });
  } catch (err: any) {
    console.error('POST /api/companion-ai error:', err);
    return fail(err.message || 'Failed to process companion AI request.', 500);
  }
}
