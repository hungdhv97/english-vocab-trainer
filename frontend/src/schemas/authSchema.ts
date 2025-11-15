import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(4, 'Username must be at least 4 characters').max(50),
  password: z.string().min(4, 'Password must be at least 4 characters')
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = loginSchema;

export type RegisterFormData = z.infer<typeof registerSchema>;

