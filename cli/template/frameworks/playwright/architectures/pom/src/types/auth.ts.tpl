import { z } from "zod";

export const authUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export type AuthUser = z.infer<typeof authUserSchema>;
