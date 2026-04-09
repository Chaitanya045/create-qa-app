import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  BASE_URL: z.url().default("https://the-internet.herokuapp.com"),
  USERNAME: z.string().min(1).default("tomsmith"),
  PASSWORD: z.string().min(1).default("SuperSecretPassword!")
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
