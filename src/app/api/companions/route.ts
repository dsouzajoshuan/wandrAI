import { NextRequest } from 'next/server';
import { createClient, getSessionUser } from '@/lib/supabase/server';
import { ok, fail } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail('Unauthorized. Please sign in.', 401);
    }

    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destination_id');
    const specialty = searchParams.get('specialty');

    const supabase = await createClient();
    let query = supabase.from('companion_profiles').select('*');

    if (destinationId) {
      query = query.eq('current_destination_id', destinationId);
    }
    if (specialty) {
      query = query.ilike('specialty', `%${specialty}%`);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return ok(data);
  } catch (err: any) {
    console.error('GET /api/companions error:', err);
    return fail(err.message || 'Failed to fetch companions.', 500);
  }
}
