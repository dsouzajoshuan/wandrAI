import { NextRequest } from 'next/server';
import { createClient, getSessionUser } from '@/lib/supabase/server';
import { ok, fail } from '@/lib/api-response';
import { tripCreateSchema } from '@/lib/validation/trips';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail('Unauthorized. Please sign in.', 401);
    }

    const body = await request.json();
    const result = tripCreateSchema.safeParse(body);

    if (!result.success) {
      return fail(result.error.format(), 400);
    }

    const { destination_id, start_date, duration_days } = result.data;
    const supabase = await createClient();

    // Verify destination exists
    const { data: destination, error: destError } = await supabase
      .from('destinations')
      .select('id')
      .eq('id', destination_id)
      .maybeSingle();

    if (destError) {
      throw destError;
    }
    if (!destination) {
      return fail('Destination not found.', 404);
    }

    const { data: trip, error } = await supabase
      .from('trips')
      .insert({
        user_id: user.id,
        destination_id,
        start_date,
        duration_days,
        status: 'planning',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return ok(trip, 201);
  } catch (err: any) {
    console.error('POST /api/trips error:', err);
    return fail(err.message || 'Failed to create trip.', 500);
  }
}
