import type { PlaywrightCliConfig } from "../../cli/src/core/schema";

const defaultPlaywrightConfig: PlaywrightCliConfig = {
  projectName: "my-qa-app",
  framework: "playwright",
  architecture: "pom",
  packageManager: "bun",
  useZod: false,
  installDeps: false,
  testDirectory: "src/tests",
  useSrcLayout: true,
  pomTemplate: "minimal",
  includePlaywrightWorkflow: false,
  playwrightReporters: ["html"],
  installPlaywrightBrowsers: false
};

export function createPlaywrightConfig(
  overrides: Partial<PlaywrightCliConfig> = {}
): PlaywrightCliConfig {
  return {
    ...defaultPlaywrightConfig,
    ...overrides,
    playwrightReporters:
      overrides.playwrightReporters ?? defaultPlaywrightConfig.playwrightReporters
  };
}

export function createAdvancedPlaywrightConfig(
  overrides: Partial<PlaywrightCliConfig> = {}
): PlaywrightCliConfig {
  return createPlaywrightConfig({
    useZod: true,
    pomTemplate: "advanced",
    includePlaywrightWorkflow: true,
    playwrightReporters: ["html", "allure"],
    installPlaywrightBrowsers: true,
    ...overrides
  });
}
