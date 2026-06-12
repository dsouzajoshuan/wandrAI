import { NextRequest } from 'next/server';
import { createClient, getSessionUser } from '@/lib/supabase/server';
import { ok, fail } from '@/lib/api-response';
import { companionSwipeSchema } from '@/lib/validation/companions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail('Unauthorized. Please sign in.', 401);
    }

    const { id: companionId } = await params;
    const body = await request.json();
    const result = companionSwipeSchema.safeParse(body);

    if (!result.success) {
      return fail(result.error.format(), 400);
    }

    const { action } = result.data;
    const supabase = await createClient();

    // 1. Verify that a match suggestion exists for current user -> companion
    const { data: userMatch, error: userMatchError } = await supabase
      .from('companion_matches')
      .select('*')
      .eq('user_id', user.id)
      .eq('companion_id', companionId)
      .maybeSingle();

    if (userMatchError) {
      throw userMatchError;
    }
    if (!userMatch) {
      return fail('No suggested match exists for this companion.', 404);
    }

    let targetStatus = action === 'pass' ? 'passed' : 'liked';
    let isMutual = false;

    if (action === 'like') {
      // 2. Check if the companion has already liked the current user
      const { data: companionMatch, error: companionMatchError } = await supabase
        .from('companion_matches')
        .select('*')
        .eq('user_id', companionId)
        .eq('companion_id', user.id)
        .maybeSingle();

      if (companionMatchError) {
        throw companionMatchError;
      }

      if (companionMatch && (companionMatch.status === 'liked' || companionMatch.status === 'matched')) {
        targetStatus = 'matched';
        isMutual = true;

        // Update the companion's match entry to matched
        const { error: updateCompanionMatchError } = await supabase
          .from('companion_matches')
          .update({ status: 'matched' })
          .eq('id', companionMatch.id);

        if (updateCompanionMatchError) {
          throw updateCompanionMatchError;
        }
      }
    }

    // 3. Update the current user's match entry
    const { data: updatedMatch, error: updateError } = await supabase
      .from('companion_matches')
      .update({ status: targetStatus })
      .eq('id', userMatch.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return ok({ match: updatedMatch, mutualMatch: isMutual });
  } catch (err: any) {
    console.error(`POST /api/companions/${request.url}/swipe error:`, err);
    return fail(err.message || 'Failed to record swipe.', 500);
  }
}
