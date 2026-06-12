import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ok, fail } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');

    const supabase = await createClient();
    let query = supabase.from('destinations').select('*');

    if (country) {
      query = query.ilike('country', `%${country}%`);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return ok(data);
  } catch (err: any) {
    console.error('GET /api/destinations error:', err);
    return fail(err.message || 'Failed to fetch destinations.', 500);
  }
}
