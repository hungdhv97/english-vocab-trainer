import { z } from 'zod';

export const profileSchema = z.object({
  display_name: z.string().max(50, 'Display name must be 50 characters or less').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional().or(z.literal(''))
});

export type ProfileFormData = z.infer<typeof profileSchema>;

