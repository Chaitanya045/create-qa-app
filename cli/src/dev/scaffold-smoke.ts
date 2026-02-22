import { rm, mkdir } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { scaffoldProject } from "../core/scaffold";
import type { CliConfig } from "../core/schema";

type SmokeCase = {
  name: string;
  config: CliConfig;
  commands: string[][];
};

function run(command: string[], options: { cwd: string }): void {
  const result = spawnSync(command[0] ?? "", command.slice(1), {
    cwd: options.cwd,
    stdio: "inherit",
    env: process.env
  });

  if (result.status !== 0) {
    throw new Error(`Command failed (exit ${String(result.status)}): ${command.join(" ")}`);
  }
}

async function main(): Promise<void> {
  const workspaceRoot = process.cwd();
  const outRoot = path.join(workspaceRoot, ".tmp-scaffold");

  await rm(outRoot, { recursive: true, force: true });
  await mkdir(outRoot, { recursive: true });

  const cases: SmokeCase[] = [
    {
      name: "playwright-pom-minimal",
      config: {
        projectName: ".tmp-scaffold/playwright-pom-minimal",
        framework: "playwright",
        architecture: "pom",
        packageManager: "bun",
        useZod: false,
        installDeps: false,
        testDirectory: "src/tests",
        useSrcLayout: true,
        pomTemplate: "minimal",
        includePlaywrightWorkflow: false,
        playwrightReporters: ["html"],
        installPlaywrightBrowsers: false
      },
      commands: [
        ["bun", "install"],
        ["bun", "run", "typecheck"]
      ]
    },
    {
      name: "playwright-pom-advanced",
      config: {
        projectName: ".tmp-scaffold/playwright-pom-advanced",
        framework: "playwright",
        architecture: "pom",
        packageManager: "bun",
        useZod: true,
        installDeps: false,
        testDirectory: "src/tests",
        useSrcLayout: true,
        pomTemplate: "advanced",
        includePlaywrightWorkflow: true,
        playwrightReporters: ["html"],
        installPlaywrightBrowsers: false
      },
      commands: [
        ["bun", "install"],
        ["bun", "run", "typecheck"]
      ]
    }
  ];

  for (const smokeCase of cases) {
    const result = await scaffoldProject(workspaceRoot, smokeCase.config);
    console.log(`\n[smoke] ${smokeCase.name}: ${result.createdFiles} files -> ${result.targetDir}`);

    for (const command of smokeCase.commands) {
      run(command, { cwd: result.targetDir });
    }
  }
}

await main();
