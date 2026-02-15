import { z } from "zod";

const envSchema = z.object({
  BASE_URL: z.string().url().default("https://playwright.dev")
});

export const env = envSchema.parse(process.env);
