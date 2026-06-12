import { z } from 'zod';

export const sosSchema = z.object({
  trip_id: z.string().uuid({ message: "Invalid trip ID format." }),
  lat: z.number().min(-90, { message: "Latitude must be between -90 and 90." }).max(90, { message: "Latitude must be between -90 and 90." }),
  lng: z.number().min(-180, { message: "Longitude must be between -180 and 180." }).max(180, { message: "Longitude must be between -180 and 180." }),
});

export const n8nWebhookSchema = z.object({
  type: z.enum(['booking_confirmation', 'sos_escalation'], {
    message: "Webhook type must be either 'booking_confirmation' or 'sos_escalation'.",
  }),
  payload: z.record(z.string(), z.any()),
});
