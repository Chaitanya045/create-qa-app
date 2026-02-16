import { z } from "zod";

const envSchema = z.object({
  BASE_URL: z.url().default("https://playwright.dev")
});

export const env = envSchema.parse(process.env);
