import { describe, expect, test } from "bun:test";
import { runCli } from "../cli/src/run-cli";

describe("runCli", () => {
  test("routes missing command to create flow", async () => {
    const calls: string[] = [];

    await runCli({
      argv: ["bun", "cli"],
      runCreate: async () => {
        calls.push("create");
      }
    });

    expect(calls).toEqual(["create"]);
  });

  test("routes explicit create command to create flow", async () => {
    const calls: string[] = [];

    await runCli({
      argv: ["bun", "cli", "create"],
      runCreate: async () => {
        calls.push("create");
      }
    });

    expect(calls).toEqual(["create"]);
  });

  test("routes flags to create flow", async () => {
    const calls: string[] = [];

    await runCli({
      argv: ["bun", "cli", "--help"],
      runCreate: async () => {
        calls.push("create");
      }
    });

    expect(calls).toEqual(["create"]);
  });

  test("prints error and exits for unknown commands", async () => {
    const errors: string[] = [];

    await expect(
      runCli({
        argv: ["bun", "cli", "unknown"],
        runCreate: async () => {
          throw new Error("should not be called");
        },
        writeError: (message) => {
          errors.push(message);
        },
        exit: (code) => {
          throw new Error(`exit:${String(code)}`);
        }
      })
    ).rejects.toThrow("exit:1");

    expect(errors).toEqual(["Unknown command: unknown", "Available commands: create"]);
  });
});
