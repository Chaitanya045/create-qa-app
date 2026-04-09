import { access, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { scaffoldProject } from "../cli/src/core/scaffold";
import type { CliConfig } from "../cli/src/core/schema";

type SmokeCase = {
  name: string;
  config: CliConfig;
  commands: string[][];
  expectedFiles: string[];
  expectedContent: Array<{
    file: string;
    includes: string[];
  }>;
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

async function assertFileExists(rootDir: string, relativePath: string): Promise<void> {
  await access(path.join(rootDir, relativePath));
}

async function assertFileContains(
  rootDir: string,
  relativePath: string,
  expectedFragments: string[]
): Promise<void> {
  const content = await readFile(path.join(rootDir, relativePath), "utf8");

  for (const expectedFragment of expectedFragments) {
    if (!content.includes(expectedFragment)) {
      throw new Error(`Expected ${relativePath} to include ${JSON.stringify(expectedFragment)}.`);
    }
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
      ],
      expectedFiles: [".env.example"],
      expectedContent: [
        {
          file: ".gitignore",
          includes: [".env", ".env.*", "!.env.example"]
        },
        {
          file: ".env.example",
          includes: ["BASE_URL=", "USERNAME=", "PASSWORD="]
        },
        {
          file: "src/config/env.ts",
          includes: ['import "dotenv/config";']
        },
        {
          file: "README.md",
          includes: ["## Environment", ".env.example", "CI provider secrets"]
        }
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
      ],
      expectedFiles: [".env.example"],
      expectedContent: [
        {
          file: ".gitignore",
          includes: [".env", ".env.*", "!.env.example"]
        },
        {
          file: ".env.example",
          includes: ["BASE_URL=", "USERNAME=", "PASSWORD="]
        },
        {
          file: "src/config/env.ts",
          includes: ['import "dotenv/config";']
        },
        {
          file: "README.md",
          includes: ["## Environment", ".env.example", "CI provider secrets"]
        }
      ]
    }
  ];

  for (const smokeCase of cases) {
    const result = await scaffoldProject(workspaceRoot, smokeCase.config);
    console.log(`\n[smoke] ${smokeCase.name}: ${result.createdFiles} files -> ${result.targetDir}`);

    for (const expectedFile of smokeCase.expectedFiles) {
      await assertFileExists(result.targetDir, expectedFile);
    }

    for (const expectedContent of smokeCase.expectedContent) {
      await assertFileContains(result.targetDir, expectedContent.file, expectedContent.includes);
    }

    for (const command of smokeCase.commands) {
      run(command, { cwd: result.targetDir });
    }
  }
}

await main();
