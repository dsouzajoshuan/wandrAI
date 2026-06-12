import { NextRequest } from 'next/server';
import { createClient, getSessionUser } from '@/lib/supabase/server';
import { ok, fail } from '@/lib/api-response';
import { companionMatchSchema } from '@/lib/validation/companions';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail('Unauthorized. Please sign in.', 401);
    }

    const body = await request.json();
    const result = companionMatchSchema.safeParse(body);

    if (!result.success) {
      return fail(result.error.format(), 400);
    }

    const { companion_id } = result.data;

    if (user.id === companion_id) {
      return fail('You cannot match with yourself.', 400);
    }

    const supabase = await createClient();

    // 1. Fetch user's interests
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('interests')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }
    if (!profile) {
      return fail('User profile not found.', 404);
    }

    // 2. Fetch companion's tags
    const { data: companion, error: companionError } = await supabase
      .from('companions')
      .select('tags')
      .eq('id', companion_id)
      .maybeSingle();

    if (companionError) {
      throw companionError;
    }
    if (!companion) {
      return fail('Companion not found.', 404);
    }

    // 3. Compute fit score (Jaccard Similarity overlap normalized to 0-100)
    const userInterests = (profile.interests || []).map((i: string) => i.toLowerCase().trim());
    const companionTags = (companion.tags || []).map((t: string) => t.toLowerCase().trim());

    let fitScore = 0;
    if (userInterests.length > 0 || companionTags.length > 0) {
      const setA = new Set(userInterests);
      const setB = new Set(companionTags);

      const intersection = new Set([...setA].filter(x => setB.has(x)));
      const union = new Set([...setA, ...setB]);

      fitScore = Math.round((intersection.size / union.size) * 100);
    }

    // 4. Upsert into companion_matches on (user_id, companion_id)
    const { data: match, error: matchError } = await supabase
      .from('companion_matches')
      .upsert({
        user_id: user.id,
        companion_id,
        fit_score: fitScore,
        status: 'suggested'
      }, {
        onConflict: 'user_id,companion_id'
      })
      .select()
      .single();

    if (matchError) {
      throw matchError;
    }

    return ok(match);
  } catch (err: any) {
    console.error('POST /api/companions/match error:', err);
    return fail(err.message || 'Failed to match companion.', 500);
  }
}
