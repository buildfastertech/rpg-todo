import { z } from 'zod';

export const createLabelSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Label name is required').max(50, 'Label name must be 50 characters or less'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code').optional(),
  }),
});

export const updateLabelSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Label name is required').max(50, 'Label name must be 50 characters or less').optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code').optional(),
  }),
});

export type CreateLabelInput = z.infer<typeof createLabelSchema>['body'];
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>['body'];

