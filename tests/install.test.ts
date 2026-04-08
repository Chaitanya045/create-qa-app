import { afterEach, describe, expect, test } from "bun:test";
import { runCommand } from "../cli/src/core/install";
import { createTempDir, removeTempDir } from "./helpers/fs";

const tempDirs: string[] = [];

afterEach(async () => {
  while (tempDirs.length > 0) {
    const tempDir = tempDirs.pop();

    if (tempDir) {
      await removeTempDir(tempDir);
    }
  }
});

describe("install command runner", () => {
  test("resolves when the command exits successfully", async () => {
    const cwd = await createTempDir("install-success-");
    tempDirs.push(cwd);

    expect(runCommand(cwd, "bun", ["--version"])).resolves.toBeUndefined();
  });

  test("rejects when the command exits with a failure code", async () => {
    const cwd = await createTempDir("install-failure-");
    tempDirs.push(cwd);

    expect(runCommand(cwd, "bun", ["-e", "process.exit(2)"])).rejects.toThrow(
      "Command failed with exit code 2: bun -e process.exit(2)"
    );
  });
});
