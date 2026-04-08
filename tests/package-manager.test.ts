import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import * as childProcess from "node:child_process";
import {
  detectPackageManager,
  getBinaryCommand,
  getInstallCommand,
  getInstallCommandParts,
  getPackageManagerAvailability,
  getPackageManagerInstallHelp,
  getPlaywrightCommand,
  getPlaywrightInstallBrowsersCommand,
  isPackageManagerInstalled
} from "../cli/src/core/package-manager";
import { createTempDir, removeTempDir, writeTextFile } from "./helpers/fs";

function createSpawnSyncResult(status: number): ReturnType<typeof childProcess.spawnSync> {
  return {
    pid: 1,
    output: [null, "", ""],
    stdout: "",
    stderr: "",
    signal: null,
    status
  };
}

afterEach(() => {
  mock.restore();
  delete process.env.npm_config_user_agent;
});

describe("package manager helpers", () => {
  test("detects package manager from user agent before lockfiles", async () => {
    const tempDir = await createTempDir("package-manager-detect-");

    try {
      await writeTextFile(tempDir, "package-lock.json", "{}");
      process.env.npm_config_user_agent = "pnpm/9.0.0 npm/? node/?";

      expect(detectPackageManager(tempDir)).toBe("pnpm");
    } finally {
      await removeTempDir(tempDir);
    }
  });

  test("detects package manager from lockfiles when user agent is missing", async () => {
    const tempDir = await createTempDir("package-manager-lockfile-");

    try {
      await writeTextFile(tempDir, "bun.lock", "");

      expect(detectPackageManager(tempDir)).toBe("bun");
    } finally {
      await removeTempDir(tempDir);
    }
  });

  test("falls back to npm when nothing is detected", async () => {
    const tempDir = await createTempDir("package-manager-default-");

    try {
      expect(detectPackageManager(tempDir)).toBe("npm");
    } finally {
      await removeTempDir(tempDir);
    }
  });

  test("builds install commands per package manager", () => {
    expect(getInstallCommandParts("yarn")).toEqual({ command: "yarn", args: [] });
    expect(getInstallCommand("bun")).toBe("bun install");
    expect(getInstallCommand("pnpm")).toBe("pnpm install");
    expect(getInstallCommand("npm")).toBe("npm install");
  });

  test("builds binary and Playwright commands per package manager", () => {
    expect(getBinaryCommand("npm", "eslint", ["."])).toBe("npx eslint .");
    expect(getBinaryCommand("pnpm", "eslint", ["."])).toBe("pnpm exec eslint .");
    expect(getBinaryCommand("yarn", "eslint", ["."])).toBe("yarn eslint .");
    expect(getBinaryCommand("bun", "eslint", ["."])).toBe("bunx eslint .");
    expect(getPlaywrightCommand("bun", ["test", "--ui"])).toBe("bunx playwright test --ui");
    expect(getPlaywrightInstallBrowsersCommand("npm", true)).toBe(
      "npx playwright install --with-deps"
    );
  });

  test("returns install help text for each package manager", () => {
    expect(getPackageManagerInstallHelp("pnpm")).toBe("npm install -g pnpm");
    expect(getPackageManagerInstallHelp("yarn")).toBe("npm install -g yarn");
    expect(getPackageManagerInstallHelp("bun")).toBe("https://bun.sh/docs/installation");
    expect(getPackageManagerInstallHelp("npm")).toContain("nodejs.org");
  });

  test("treats successful version checks as installed", () => {
    const spawnSyncSpy = spyOn(childProcess, "spawnSync").mockReturnValue(createSpawnSyncResult(0));

    expect(isPackageManagerInstalled("bun")).toBe(true);
    expect(spawnSyncSpy).toHaveBeenCalledWith("bun", ["--version"], {
      stdio: "ignore",
      shell: process.platform === "win32"
    });
  });

  test("reports unavailable package managers from failed version checks", () => {
    spyOn(childProcess, "spawnSync").mockReturnValue(createSpawnSyncResult(1));

    expect(isPackageManagerInstalled("pnpm")).toBe(false);
  });

  test("checks availability for all supported package managers", () => {
    const spawnSyncSpy = spyOn(childProcess, "spawnSync")
      .mockReturnValueOnce(createSpawnSyncResult(0))
      .mockReturnValueOnce(createSpawnSyncResult(1))
      .mockReturnValueOnce(createSpawnSyncResult(0))
      .mockReturnValueOnce(createSpawnSyncResult(1));

    expect(getPackageManagerAvailability()).toEqual({
      npm: true,
      pnpm: false,
      yarn: true,
      bun: false
    });

    expect(spawnSyncSpy).toHaveBeenCalledTimes(4);
  });
});
