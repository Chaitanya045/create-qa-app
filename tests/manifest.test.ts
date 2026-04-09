import { describe, expect, test } from "bun:test";
import { createTemplateManifest } from "../cli/src/template/manifest";
import {
  createAdvancedPlaywrightConfig,
  createPlaywrightConfig
} from "./helpers/playwright-config.fixture";
import { resolvedVersions } from "./helpers/resolved-versions";

describe("template manifest", () => {
  test("generates minimal Playwright assets without workflow", () => {
    const manifest = createTemplateManifest(createPlaywrightConfig(), {
      resolvedVersions
    });

    expect(manifest.assets.map((asset) => asset.destination)).toContain(".env.example");
    expect(manifest.assets.map((asset) => asset.destination)).toContain("src/tests/home.spec.ts");
    expect(manifest.assets.map((asset) => asset.destination)).not.toContain(
      ".github/workflows/playwright.yml"
    );
    expect(manifest.variables.packageName).toBe("my-qa-app");
    expect(manifest.variables.playwrightReporterConfig).toBe(
      '[["line"], ["html", { open: "never" }]]'
    );
    expect(manifest.variables.playwrightPomPageImportPath).toBe("../pages/home.page");
    expect(manifest.variables.playwrightZodDependencyLine).toBe("");
    expect(manifest.variables.versionDotenv).toBe("17.4.1");
  });

  test("generates advanced assets, workflow, and reporter variables", () => {
    const manifest = createTemplateManifest(
      createAdvancedPlaywrightConfig({
        projectName: "QA Project!",
        packageManager: "npm"
      }),
      { resolvedVersions }
    );

    expect(manifest.assets.map((asset) => asset.destination)).toEqual(
      expect.arrayContaining([
        ".github/workflows/playwright.yml",
        "src/fixtures/test.fixture.ts",
        "src/data/test-data.ts",
        "src/types/auth.ts",
        "src/tests/login.spec.ts"
      ])
    );
    expect(manifest.variables.packageName).toBe("qa-project");
    expect(manifest.variables.playwrightPomFixtureImportPath).toBe("../fixtures/test.fixture");
    expect(manifest.variables.playwrightPomLoginPageImportPathFromFixtures).toBe(
      "../pages/login.page"
    );
    expect(manifest.variables.playwrightUserAgentLine).toContain("userAgent");
    expect(manifest.variables.playwrightLocaleLine).toContain("locale");
    expect(manifest.variables.playwrightAllurePlaywrightDependencyLine).toContain(
      '"allure-playwright": "3.4.1"'
    );
    expect(manifest.variables.playwrightWorkflowInstallCommand).toBe("npm install");
    expect(manifest.variables.playwrightWorkflowAllureGenerateCommand).toBe(
      "npx allure generate allure-results --clean -o allure-report"
    );
    expect(manifest.variables.playwrightSelectedReportersList).toBe("- `HTML`\n- `Allure`");
  });

  test("renders non-src layouts with correct relative imports", () => {
    const manifest = createTemplateManifest(
      createAdvancedPlaywrightConfig({
        useSrcLayout: false,
        testDirectory: "tests/e2e"
      }),
      { resolvedVersions }
    );

    expect(manifest.variables.playwrightEnvImportPath).toBe("./config/env");
    expect(manifest.variables.playwrightPomPageImportPath).toBe("../../pages/login.page");
    expect(manifest.variables.playwrightPomFixtureImportPath).toBe("../../fixtures/test.fixture");
    expect(manifest.variables.playwrightPomAuthTypesImportPathFromPages).toBe("../types/auth");
  });

  test("falls back to latest when versions are missing", () => {
    const manifest = createTemplateManifest(
      createPlaywrightConfig({ useZod: true, playwrightReporters: ["allure"] }),
      { resolvedVersions: {} }
    );

    expect(manifest.variables.versionPlaywrightTest).toBe("latest");
    expect(manifest.variables.playwrightAllureCommandlineDependencyLine).toContain(
      '"allure-commandline": "latest"'
    );
  });

  test("selects the html workflow template for html-only reporting", () => {
    const manifest = createTemplateManifest(
      createAdvancedPlaywrightConfig({ playwrightReporters: ["html"] }),
      { resolvedVersions }
    );

    expect(
      manifest.assets.find((asset) => asset.destination === ".github/workflows/playwright.yml")
        ?.source
    ).toBe("frameworks/playwright/.github/workflows/playwright.workflow.html.yml.tpl");
  });

  test("selects the allure workflow template for allure-only reporting", () => {
    const manifest = createTemplateManifest(
      createAdvancedPlaywrightConfig({ playwrightReporters: ["allure"] }),
      { resolvedVersions }
    );

    expect(
      manifest.assets.find((asset) => asset.destination === ".github/workflows/playwright.yml")
        ?.source
    ).toBe("frameworks/playwright/.github/workflows/playwright.workflow.allure.yml.tpl");
  });
});
