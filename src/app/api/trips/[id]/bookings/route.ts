import { NextRequest } from 'next/server';
import { createClient, getSessionUser } from '@/lib/supabase/server';
import { ok, fail } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail('Unauthorized. Please sign in.', 401);
    }

    const { id: tripId } = await params;
    const supabase = await createClient();

    // Verify trip ownership
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (tripError) {
      throw tripError;
    }
    if (!trip) {
      return fail('Trip not found or access denied.', 404);
    }

    // Fetch bookings for the trip
    const { data: bookings, error: bookingsError } = await supabase
      .from('trip_bookings')
      .select('id, name, type, lat, lng, scheduled_time, status, provider_ref')
      .eq('trip_id', tripId);

    if (bookingsError) {
      throw bookingsError;
    }

    return ok(bookings);
  } catch (err: any) {
    console.error(`GET /api/trips/${request.url}/bookings error:`, err);
    return fail(err.message || 'Failed to fetch bookings.', 500);
  }
}
