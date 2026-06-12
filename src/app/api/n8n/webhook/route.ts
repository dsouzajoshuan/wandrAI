import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ok, fail } from '@/lib/api-response';
import { n8nWebhookSchema } from '@/lib/validation/safety';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify x-n8n-secret header
    const n8nSecret = request.headers.get('x-n8n-secret');
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!expectedSecret) {
      console.error('N8N_WEBHOOK_SECRET environment variable is not configured.');
      return fail('Internal server configuration error.', 500);
    }

    if (n8nSecret !== expectedSecret) {
      return fail('Unauthorized. Secret token mismatch.', 401);
    }

    const body = await request.json();
    const result = n8nWebhookSchema.safeParse(body);

    if (!result.success) {
      return fail(result.error.format(), 400);
    }

    const { type, payload } = result.data;
    const adminSupabase = createAdminClient();

    if (type === 'booking_confirmation') {
      const { provider_ref, status = 'confirmed' } = payload;
      if (!provider_ref) {
        return fail('Missing provider_ref in payload for booking_confirmation.', 400);
      }

      const { data, error } = await adminSupabase
        .from('trip_bookings')
        .update({ status })
        .eq('provider_ref', provider_ref)
        .select();

      if (error) {
        throw error;
      }

      return ok({ updated_bookings: data });
    }

    if (type === 'sos_escalation') {
      const { alert_id, status } = payload;
      if (!alert_id) {
        return fail('Missing alert_id in payload for sos_escalation.', 400);
      }
      if (!status) {
        return fail('Missing status in payload for sos_escalation.', 400);
      }

      const { data, error } = await adminSupabase
        .from('safety_alerts')
        .update({ status })
        .eq('id', alert_id)
        .select();

      if (error) {
        throw error;
      }

      return ok({ updated_alerts: data });
    }

    return fail('Unsupported action type.', 400);
  } catch (err: any) {
    console.error('POST /api/n8n/webhook error:', err);
    return fail(err.message || 'Webhook processing failed.', 500);
  }
}
