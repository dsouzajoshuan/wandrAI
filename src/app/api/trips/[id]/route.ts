import { NextRequest } from 'next/server';
import { createClient, getSessionUser } from '@/lib/supabase/server';
import { ok, fail } from '@/lib/api-response';
import { tripPatchSchema } from '@/lib/validation/trips';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail('Unauthorized. Please sign in.', 401);
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data: trip, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }
    if (!trip) {
      return fail('Trip not found or access denied.', 404);
    }

    return ok(trip);
  } catch (err: any) {
    console.error(`GET /api/trips/${request.url} error:`, err);
    return fail(err.message || 'Failed to fetch trip.', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail('Unauthorized. Please sign in.', 401);
    }

    const { id } = await params;
    const body = await request.json();
    const result = tripPatchSchema.safeParse(body);

    if (!result.success) {
      return fail(result.error.format(), 400);
    }

    const supabase = await createClient();

    // Verify ownership first
    const { data: tripCheck, error: checkError } = await supabase
      .from('trips')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }
    if (!tripCheck) {
      return fail('Trip not found or access denied.', 404);
    }

    // Perform patch update
    const { data: updatedTrip, error: updateError } = await supabase
      .from('trips')
      .update(result.data)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return ok(updatedTrip);
  } catch (err: any) {
    console.error(`PATCH /api/trips/${request.url} error:`, err);
    return fail(err.message || 'Failed to update trip.', 500);
  }
}
