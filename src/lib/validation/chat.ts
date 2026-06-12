import { z } from 'zod';

export const chatMessageSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty." }),
  recipient_id: z.string().uuid({ message: "Invalid recipient ID format." }).nullable().optional(),
});

export const aiHistoryItemSchema = z.object({
  role: z.enum(['user', 'model', 'assistant']),
  content: z.string().optional(),
  parts: z.union([
    z.string(),
    z.array(z.object({ text: z.string() }))
  ]).optional(),
});

export const aiChatRequestSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty." }),
  history: z.array(aiHistoryItemSchema).optional(),
});

export const orchestratorAiSchema = aiChatRequestSchema.extend({
  trip_id: z.string().uuid({ message: "Invalid trip ID format." }),
});

export const companionAiSchema = aiChatRequestSchema.extend({
  companion_id: z.string().uuid({ message: "Invalid companion ID format." }).optional(),
});
