import { NextRequest } from 'next/server';
import { createClient, getSessionUser } from '@/lib/supabase/server';
import { ok, fail } from '@/lib/api-response';
import { chatMessageSchema } from '@/lib/validation/chat';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail('Unauthorized. Please sign in.', 401);
    }

    const { conversationId } = await params;
    const supabase = await createClient();

    // Fetch messages where user is sender or recipient, or it's a group chat (recipient_id is null)
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id},recipient_id.is.null`)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return ok(messages);
  } catch (err: any) {
    console.error(`GET /api/chat/${request.url} error:`, err);
    return fail(err.message || 'Failed to fetch messages.', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail('Unauthorized. Please sign in.', 401);
    }

    const { conversationId } = await params;
    const body = await request.json();
    const result = chatMessageSchema.safeParse(body);

    if (!result.success) {
      return fail(result.error.format(), 400);
    }

    const { message, recipient_id } = result.data;
    const supabase = await createClient();

    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        recipient_id: recipient_id || null,
        message,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return ok(newMessage, 201);
  } catch (err: any) {
    console.error(`POST /api/chat/${request.url} error:`, err);
    return fail(err.message || 'Failed to save message.', 500);
  }
}
