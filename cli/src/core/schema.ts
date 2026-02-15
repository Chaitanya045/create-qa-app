import { z } from "zod";

export const frameworkSchema = z.enum(["playwright", "cypress"]);
export const architectureSchema = z.enum(["pom", "feature"]);

export const cliConfigSchema = z.object({
  projectName: z.string().min(1),
  framework: frameworkSchema,
  architecture: architectureSchema,
  installDeps: z.boolean()
});

export type Framework = z.infer<typeof frameworkSchema>;
export type Architecture = z.infer<typeof architectureSchema>;
export type CliConfig = z.infer<typeof cliConfigSchema>;
