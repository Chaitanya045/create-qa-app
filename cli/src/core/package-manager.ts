import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type PackageManagerAvailability = Record<PackageManager, boolean>;
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

function getPackageManagerBinary(packageManager: PackageManager): string {
  return packageManager;
}

export function isPackageManagerInstalled(packageManager: PackageManager): boolean {
  const binary = getPackageManagerBinary(packageManager);
  const result = spawnSync(binary, ["--version"], {
    stdio: "ignore",
    shell: process.platform === "win32"
  });

  if (result.error) {
    return false;
  }

  return result.status === 0;
}

export function getPackageManagerAvailability(): PackageManagerAvailability {
  return {
    npm: isPackageManagerInstalled("npm"),
    pnpm: isPackageManagerInstalled("pnpm"),
    yarn: isPackageManagerInstalled("yarn"),
    bun: isPackageManagerInstalled("bun")
  };
}

export function getPackageManagerInstallHelp(packageManager: PackageManager): string {
  if (packageManager === "pnpm") {
    return "npm install -g pnpm";
  }

  if (packageManager === "yarn") {
    return "npm install -g yarn";
  }

  if (packageManager === "bun") {
    return "https://bun.sh/docs/installation";
  }

  return "Install Node.js (includes npm): https://nodejs.org/en/download";
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
