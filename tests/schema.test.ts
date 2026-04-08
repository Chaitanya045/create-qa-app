import { describe, expect, test } from "bun:test";
import {
  cliConfigSchema,
  packageManagerSchema,
  playwrightReporterSchema
} from "../cli/src/core/schema";
import {
  createAdvancedPlaywrightConfig,
  createPlaywrightConfig
} from "./helpers/playwright-config.fixture";

describe("schema", () => {
  test("accepts a valid advanced Playwright configuration", () => {
    const parsed = cliConfigSchema.parse(createAdvancedPlaywrightConfig());

    expect(parsed.pomTemplate).toBe("advanced");
    expect(parsed.playwrightReporters).toEqual(["html", "allure"]);
  });

  test("requires at least one Playwright reporter", () => {
    const result = cliConfigSchema.safeParse(createPlaywrightConfig({ playwrightReporters: [] }));

    expect(result.success).toBe(false);
  });

  test("rejects unsupported package managers", () => {
    const result = packageManagerSchema.safeParse("pip");

    expect(result.success).toBe(false);
  });

  test("restricts reporters to supported values", () => {
    const result = playwrightReporterSchema.safeParse("json");

    expect(result.success).toBe(false);
  });
});
