import { z } from 'zod';

export const companionMatchSchema = z.object({
  companion_id: z.string().uuid({ message: "Invalid companion ID format." }),
});

export const companionSwipeSchema = z.object({
  action: z.enum(['like', 'pass'], {
    message: "Action must be either 'like' or 'pass'.",
  }),
});
