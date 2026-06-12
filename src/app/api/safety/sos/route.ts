import { NextRequest } from 'next/server';
import { createClient, getSessionUser } from '@/lib/supabase/server';
import { ok, fail } from '@/lib/api-response';
import { sosSchema } from '@/lib/validation/safety';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail('Unauthorized. Please sign in.', 401);
    }

    const body = await request.json();
    const result = sosSchema.safeParse(body);

    if (!result.success) {
      return fail(result.error.format(), 400);
    }

    const { trip_id, lat, lng } = result.data;
    const supabase = await createClient();

    // 1. Verify trip ownership
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id')
      .eq('id', trip_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (tripError) {
      throw tripError;
    }
    if (!trip) {
      return fail('Trip not found or access denied.', 404);
    }

    // 2. Insert safety alert row
    const { data: alertData, error: alertError } = await supabase
      .from('safety_alerts')
      .insert({
        user_id: user.id,
        trip_id,
        lat,
        lng,
        status: 'active',
      })
      .select()
      .single();

    if (alertError) {
      throw alertError;
    }

    // 3. Fire-and-forget notification to n8n webhook (asynchronous fetch)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_id: alertData.id,
          user_id: user.id,
          full_name: user.user_metadata?.full_name || '',
          phone: user.phone || '',
          trip_id,
          lat,
          lng,
          status: 'active',
          timestamp: new Date().toISOString()
        })
      }).catch((err) => {
        console.error('SOS n8n webhook notification failure:', err);
      });
    } else {
      console.warn('N8N_WEBHOOK_URL environment variable is not defined.');
    }

    return ok(alertData, 201);
  } catch (err: any) {
    console.error('POST /api/safety/sos error:', err);
    return fail(err.message || 'Failed to trigger SOS alert.', 500);
  }
}
