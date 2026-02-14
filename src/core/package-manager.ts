import { existsSync } from "node:fs";
import path from "node:path";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

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

export function getInstallCommand(packageManager: PackageManager): string {
  if (packageManager === "yarn") {
    return "yarn";
  }

  if (packageManager === "bun") {
    return "bun install";
  }

  if (packageManager === "pnpm") {
    return "pnpm install";
  }

  return "npm install";
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
