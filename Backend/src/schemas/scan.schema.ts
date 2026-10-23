import { z } from 'zod';

export const createMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty').max(4000),
});

export const listScansQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type ListScansQuery = z.infer<typeof listScansQuerySchema>;
