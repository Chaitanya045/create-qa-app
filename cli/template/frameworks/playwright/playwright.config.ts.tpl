import { defineConfig } from "@playwright/test";
import { env } from "{{playwrightEnvImportPath}}";

export default defineConfig({
  testDir: "./{{playwrightTestDirectory}}",
  fullyParallel: true,
  reporter: {{playwrightReporterConfig}},
{{playwrightGlobalSetupLine}}
  use: {
    baseURL: env.BASE_URL,
    trace: "on-first-retry"{{playwrightStorageStateLine}}{{playwrightUserAgentLine}}{{playwrightLocaleLine}}
  }
});
