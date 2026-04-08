import { describe, expect, test } from "bun:test";
import {
  getInstalledPackageManagerOptions,
  getPackageManagerOptionsWithStatus,
  normalizeTestDirectory,
  validatePlaywrightTestDirectory,
  validateProjectName
} from "../cli/src/commands/create/prompts";

describe("prompt helpers", () => {
  test("validates project names", () => {
    expect(validateProjectName(undefined)).toBe("Project name is required.");
    expect(validateProjectName(".")).toBe("Choose a real folder name.");
    expect(validateProjectName("nested/project")).toBe("Use a single folder name, not a path.");
    expect(validateProjectName("my-project")).toBeUndefined();
  });

  test("normalizes test directory input", () => {
    expect(normalizeTestDirectory("./tests\\e2e/")).toBe("tests/e2e");
    expect(normalizeTestDirectory("tests")).toBe("tests");
  });

  test("validates Playwright test directories", () => {
    expect(validatePlaywrightTestDirectory("")).toBe("Test directory is required.");
    expect(validatePlaywrightTestDirectory(".")).toBe("Enter a valid test directory path.");
    expect(validatePlaywrightTestDirectory("src/tests")).toBe(
      'Enter a folder name without the leading "src/" (for example: "tests").'
    );
    expect(validatePlaywrightTestDirectory("../tests")).toBe(
      "Parent directory segments are not allowed."
    );
    expect(validatePlaywrightTestDirectory("tests/e2e")).toBeUndefined();
  });

  test("annotates package manager availability", () => {
    const options = getPackageManagerOptionsWithStatus({
      npm: true,
      pnpm: false,
      yarn: true,
      bun: false
    });

    expect(options).toEqual([
      { value: "npm", label: "npm", hint: "installed" },
      { value: "pnpm", label: "pnpm", hint: "not installed" },
      { value: "yarn", label: "yarn", hint: "installed" },
      { value: "bun", label: "bun", hint: "not installed" }
    ]);
  });

  test("filters to installed package managers", () => {
    const installedOptions = getInstalledPackageManagerOptions({
      npm: false,
      pnpm: true,
      yarn: false,
      bun: true
    });

    expect(installedOptions).toEqual([
      { value: "pnpm", label: "pnpm", hint: "installed" },
      { value: "bun", label: "bun", hint: "installed" }
    ]);
  });
});
