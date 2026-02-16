import { existsSync } from "node:fs";
import path from "node:path";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type CommandParts = {
  command: string;
  args: string[];
};

function getBinaryCommandParts(
  packageManager: PackageManager,
  binaryName: string,
  args: string[]
): CommandParts {
  if (packageManager === "npm") {
    return { command: "npx", args: [binaryName, ...args] };
  }

  if (packageManager === "pnpm") {
    return { command: "pnpm", args: ["exec", binaryName, ...args] };
  }

  if (packageManager === "yarn") {
    return { command: "yarn", args: [binaryName, ...args] };
  }

  return { command: "bunx", args: [binaryName, ...args] };
}

function detectFromUserAgent(userAgent: string): PackageManager | null {
  if (userAgent.startsWith("pnpm")) {
    return "pnpm";
  }

  if (userAgent.startsWith("yarn")) {
    return "yarn";
  }

  if (userAgent.startsWith("bun")) {
    return "bun";
  }

  if (userAgent.startsWith("npm")) {
    return "npm";
  }

  return null;
}

function detectFromLockfile(cwd: string): PackageManager | null {
  if (existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (existsSync(path.join(cwd, "yarn.lock"))) {
    return "yarn";
  }

  if (existsSync(path.join(cwd, "bun.lock")) || existsSync(path.join(cwd, "bun.lockb"))) {
    return "bun";
  }

  if (existsSync(path.join(cwd, "package-lock.json"))) {
    return "npm";
  }

  return null;
}

export function detectPackageManager(cwd: string): PackageManager {
  const userAgent = process.env.npm_config_user_agent ?? "";
  const packageManagerFromAgent = detectFromUserAgent(userAgent);

  if (packageManagerFromAgent) {
    return packageManagerFromAgent;
  }

  return detectFromLockfile(cwd) ?? "npm";
}

export function getInstallCommandParts(packageManager: PackageManager): CommandParts {
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

export function getInstallCommand(packageManager: PackageManager): string {
  const installCommandParts = getInstallCommandParts(packageManager);

  if (installCommandParts.args.length === 0) {
    return installCommandParts.command;
  }

  return `${installCommandParts.command} ${installCommandParts.args.join(" ")}`;
}

export function getScriptCommand(packageManager: PackageManager, script: string): string {
  if (packageManager === "yarn") {
    return `yarn ${script}`;
  }

  if (packageManager === "pnpm") {
    return `pnpm ${script}`;
  }

  if (packageManager === "bun") {
    return `bun run ${script}`;
  }

  return `npm run ${script}`;
}

export function getPlaywrightCommandParts(
  packageManager: PackageManager,
  args: string[]
): CommandParts {
  return getBinaryCommandParts(packageManager, "playwright", args);
}

export function getPlaywrightCommand(packageManager: PackageManager, args: string[]): string {
  const playwrightCommandParts = getPlaywrightCommandParts(packageManager, args);
  return `${playwrightCommandParts.command} ${playwrightCommandParts.args.join(" ")}`;
}

export function getPlaywrightInstallBrowsersCommandParts(
  packageManager: PackageManager,
  includeDeps: boolean
): CommandParts {
  const args = includeDeps ? ["install", "--with-deps"] : ["install"];
  return getPlaywrightCommandParts(packageManager, args);
}

export function getPlaywrightInstallBrowsersCommand(
  packageManager: PackageManager,
  includeDeps: boolean
): string {
  const commandParts = getPlaywrightInstallBrowsersCommandParts(packageManager, includeDeps);
  return `${commandParts.command} ${commandParts.args.join(" ")}`;
}

export function getBinaryCommand(
  packageManager: PackageManager,
  binaryName: string,
  args: string[]
): string {
  const commandParts = getBinaryCommandParts(packageManager, binaryName, args);
  return `${commandParts.command} ${commandParts.args.join(" ")}`;
}
