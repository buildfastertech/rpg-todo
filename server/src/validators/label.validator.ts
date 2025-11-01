import { z } from 'zod';

export const createLabelSchema = z.object({
  name: z.string().min(1, 'Label name is required').max(50, 'Label name must be 50 characters or less').trim(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #6B7280)').default('#6B7280').optional(),
});

export const updateLabelSchema = z.object({
  name: z.string().min(1, 'Label name is required').max(50, 'Label name must be 50 characters or less').trim().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #6B7280)').optional(),
});

export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;

