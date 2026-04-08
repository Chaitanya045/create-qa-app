import { describe, expect, test } from "bun:test";
import {
  getErrorMessage,
  getNextSteps,
  getPlaywrightDependencyPackages
} from "../cli/src/commands/create/index";
import {
  createAdvancedPlaywrightConfig,
  createPlaywrightConfig
} from "./helpers/playwright-config.fixture";

describe("create command helpers", () => {
  test("formats error messages", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
    expect(getErrorMessage("boom")).toBe("Unexpected error while creating the project.");
  });

  test("builds dependency list for minimal projects", () => {
    expect(getPlaywrightDependencyPackages(createPlaywrightConfig())).toEqual([
      "@playwright/test",
      "@types/node",
      "typescript",
      "eslint",
      "@eslint/js",
      "typescript-eslint",
      "eslint-plugin-playwright",
      "eslint-config-prettier",
      "prettier",
      "husky",
      "lint-staged"
    ]);
  });

  test("adds optional dependencies for zod and allure", () => {
    expect(getPlaywrightDependencyPackages(createAdvancedPlaywrightConfig())).toEqual(
      expect.arrayContaining(["zod", "allure-playwright", "allure-commandline"])
    );
  });

  test("builds next steps when dependencies were not installed", () => {
    expect(getNextSteps(createPlaywrightConfig())).toEqual([
      "cd my-qa-app",
      "bun install",
      "bunx playwright test",
      "bunx playwright test --ui",
      "bunx playwright codegen"
    ]);
  });

  test("adds browser installation step when deps were installed without browsers", () => {
    expect(
      getNextSteps(
        createPlaywrightConfig({
          packageManager: "npm",
          installDeps: true,
          installPlaywrightBrowsers: false
        })
      )
    ).toEqual([
      "cd my-qa-app",
      "npx playwright install",
      "npx playwright test",
      "npx playwright test --ui",
      "npx playwright codegen"
    ]);
  });

  test("skips browser installation step when browsers were already installed", () => {
    expect(
      getNextSteps(
        createPlaywrightConfig({
          packageManager: "pnpm",
          installDeps: true,
          installPlaywrightBrowsers: true
        })
      )
    ).toEqual([
      "cd my-qa-app",
      "pnpm exec playwright test",
      "pnpm exec playwright test --ui",
      "pnpm exec playwright codegen"
    ]);
  });
});
