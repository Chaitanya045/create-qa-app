import { spawn } from "node:child_process";
import {
  getInstallCommandParts,
  getPlaywrightInstallBrowsersCommandParts,
  type PackageManager
} from "./package-manager";

export async function runCommand(cwd: string, command: string, args: string[]): Promise<void> {
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

      reject(
        new Error(`Command failed with exit code ${String(exitCode)}: ${command} ${args.join(" ")}`)
      );
    });
  });
}

export async function installDependencies(
  cwd: string,
  packageManager: PackageManager
): Promise<void> {
  const installCommandParts = getInstallCommandParts(packageManager);
  await runCommand(cwd, installCommandParts.command, installCommandParts.args);
}

export async function installPlaywrightBrowsers(
  cwd: string,
  packageManager: PackageManager
): Promise<void> {
  const browserInstallCommandParts = getPlaywrightInstallBrowsersCommandParts(
    packageManager,
    false
  );
  await runCommand(cwd, browserInstallCommandParts.command, browserInstallCommandParts.args);
}
