import { z } from "zod";

export const frameworkSchema = z.enum(["playwright"]);
export const architectureSchema = z.enum(["pom"]);
export const packageManagerSchema = z.enum(["npm", "pnpm", "yarn", "bun"]);
export const playwrightReporterSchema = z.enum(["html", "allure"]);
export const playwrightPomTemplateSchema = z.enum(["minimal", "advanced"]);

const baseCliConfigSchema = z.object({
  projectName: z.string().min(1),
  architecture: architectureSchema,
  packageManager: packageManagerSchema,
  useZod: z.boolean(),
  installDeps: z.boolean()
});

const playwrightCliConfigSchema = baseCliConfigSchema.extend({
  framework: z.literal("playwright"),
  testDirectory: z.string().min(1),
  useSrcLayout: z.boolean(),
  pomTemplate: playwrightPomTemplateSchema,
  includePlaywrightWorkflow: z.boolean(),
  playwrightReporters: z.array(playwrightReporterSchema).min(1),
  installPlaywrightBrowsers: z.boolean()
});

export const cliConfigSchema = playwrightCliConfigSchema;

export type Framework = z.infer<typeof frameworkSchema>;
export type Architecture = z.infer<typeof architectureSchema>;
export type PackageManagerOption = z.infer<typeof packageManagerSchema>;
export type PlaywrightReporter = z.infer<typeof playwrightReporterSchema>;
export type PlaywrightPomTemplate = z.infer<typeof playwrightPomTemplateSchema>;
export type CliConfig = z.infer<typeof cliConfigSchema>;
export type PlaywrightCliConfig = z.infer<typeof cliConfigSchema>;
