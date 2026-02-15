import { spawn } from "node:child_process";
import type { PackageManager } from "./package-manager";

function getInstallCommand(packageManager: PackageManager): { command: string; args: string[] } {
  if (packageManager === "yarn") {
    return { command: "yarn", args: [] };
  }

  if (packageManager === "bun") {
    return { command: "bun", args: ["install"] };
  }

  if (packageManager === "pnpm") {
    return { command: "pnpm", args: ["install"] };
  }

  return { command: "npm", args: ["install"] };
}

export async function installDependencies(
  cwd: string,
  packageManager: PackageManager
): Promise<void> {
  const { command, args } = getInstallCommand(packageManager);

  await new Promise<void>((resolve, reject) => {
    const childProcess = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32"
    });

    childProcess.on("error", (error) => {
      reject(error);
    });

    childProcess.on("close", (exitCode) => {
      if (exitCode === 0) {
        resolve();
        return;
      }

      reject(new Error(`Dependency install failed with exit code ${String(exitCode)}.`));
    });
  });
}
