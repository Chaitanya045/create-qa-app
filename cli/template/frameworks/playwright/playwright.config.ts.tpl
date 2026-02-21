import { defineConfig } from "@playwright/test";
import { env } from "{{playwrightEnvImportPath}}";

export default defineConfig({
  testDir: "./{{playwrightTestDirectory}}",
  fullyParallel: true,
  reporter: {{playwrightReporterConfig}},
  use: {
    baseURL: env.BASE_URL,
    trace: "on-first-retry"{{playwrightUserAgentLine}}{{playwrightLocaleLine}}
  }
});
