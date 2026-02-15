import { z } from "zod";

const envSchema = z.object({
  BASE_URL: z.string().url().default("https://example.cypress.io")
});

export const env = envSchema.parse(process.env);
