import { z } from 'zod';

export const tripCreateSchema = z.object({
  destination_id: z.string().uuid({ message: "Invalid destination ID format." }),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date format (must be a valid date string).",
  }),
  duration_days: z.number().int().positive({ message: "Duration days must be a positive integer." }),
});

export const tripPatchSchema = z.object({
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date format.",
  }).optional(),
  duration_days: z.number().int().positive({ message: "Duration days must be a positive integer." }).optional(),
  status: z.enum(['planning', 'confirmed', 'active', 'completed'], {
    message: "Invalid status. Must be 'planning', 'confirmed', 'active', or 'completed'.",
  }).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field (start_date, duration_days, status) must be provided for update."
});
