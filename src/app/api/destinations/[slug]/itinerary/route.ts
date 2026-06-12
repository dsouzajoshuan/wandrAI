import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ok, fail } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days');

    if (!days || (days !== '3' && days !== '5')) {
      return fail('Invalid days query parameter. Must be 3 or 5.', 400);
    }

    const durationDays = parseInt(days, 10);
    const supabase = await createClient();

    // Find destination by slug
    const { data: destination, error: destError } = await supabase
      .from('destinations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (destError) {
      throw destError;
    }
    if (!destination) {
      return fail('Destination not found.', 404);
    }

    // Retrieve itineraries ordered by day_number and order_index
    const { data: itineraries, error: itinError } = await supabase
      .from('itineraries')
      .select('*')
      .eq('destination_id', destination.id)
      .eq('duration_days', durationDays)
      .order('day_number', { ascending: true })
      .order('order_index', { ascending: true });

    if (itinError) {
      throw itinError;
    }

    return ok(itineraries);
  } catch (err: any) {
    console.error('GET /api/destinations/[slug]/itinerary error:', err);
    return fail(err.message || 'Failed to fetch itinerary.', 500);
  }
}
