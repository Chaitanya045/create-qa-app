import path from "node:path";
import { loadClack } from "../../cli/clack";
import { promptForConfig } from "./prompts";
import { installDependencies, installPlaywrightBrowsers } from "../../core/install";
import {
  detectPackageManager,
  getInstallCommand,
  getPlaywrightCommand,
  getPlaywrightInstallBrowsersCommand,
  getScriptCommand
} from "../../core/package-manager";
import { scaffoldProject } from "../../core/scaffold";
import { resolveLatestVersions, type ResolvedVersions } from "../../core/version-resolver";
import type { PlaywrightCliConfig } from "../../core/schema";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error while creating the project.";
}

function getPlaywrightDependencyPackages(config: PlaywrightCliConfig): string[] {
  const dependencies = ["@playwright/test", "@types/node", "typescript"];
  dependencies.push(
    "eslint",
    "@eslint/js",
    "typescript-eslint",
    "eslint-plugin-playwright",
    "eslint-config-prettier",
    "prettier",
    "husky",
    "lint-staged"
  );

  if (config.useZod) {
    dependencies.push("zod");
  }

  if (config.playwrightReporters.includes("allure")) {
    dependencies.push("allure-playwright", "allure-commandline");
  }

  return dependencies;
}

export async function runCreateCommand(): Promise<void> {
  const clack = await loadClack();
  clack.intro("create-qa-app");
  const detectedPackageManager = detectPackageManager(process.cwd());

  const config = await promptForConfig(clack, {
    defaultPackageManager: detectedPackageManager
  });

  if (!config) {
    clack.cancel("Operation cancelled.");
    return;
  }

  const spinner = clack.spinner();
  let resolvedVersions: ResolvedVersions = {};

  try {
    if (config.framework === "playwright") {
      spinner.start("Resolving latest dependency versions...");
      const dependencyResolutionResult = await resolveLatestVersions(
        getPlaywrightDependencyPackages(config)
      );
      resolvedVersions = dependencyResolutionResult.versions;
      spinner.stop("Resolved dependency versions.");

      if (dependencyResolutionResult.failedPackages.length > 0) {
        clack.log.warn(
          `Failed to resolve exact versions for ${dependencyResolutionResult.failedPackages.join(", ")}. Falling back to "latest" for those packages.`
        );
      }
    }

    spinner.start("Scaffolding project...");
    const scaffoldResult = await scaffoldProject(process.cwd(), config, {
      resolvedVersions
    });
    spinner.stop(
      `Created ${path.basename(scaffoldResult.targetDir)} with ${String(scaffoldResult.createdFiles)} files.`
    );

    if (config.installDeps) {
      spinner.start(`Installing dependencies using ${config.packageManager}...`);
      await installDependencies(scaffoldResult.targetDir, config.packageManager);
      spinner.stop("Dependencies installed.");

      if (config.framework === "playwright" && config.installPlaywrightBrowsers) {
        spinner.start("Installing Playwright browsers...");
        await installPlaywrightBrowsers(scaffoldResult.targetDir, config.packageManager);
        spinner.stop("Playwright browsers installed.");
      }
    }
  } catch (error) {
    spinner.stop("Project setup failed.");
    clack.cancel(getErrorMessage(error));
    process.exit(1);
  }

  const nextSteps = [`cd ${config.projectName}`];

  if (!config.installDeps) {
    nextSteps.push(getInstallCommand(config.packageManager));
  }

  if (config.framework === "playwright") {
    if (config.installDeps && !config.installPlaywrightBrowsers) {
      nextSteps.push(getPlaywrightInstallBrowsersCommand(config.packageManager, false));
    }

    nextSteps.push(getPlaywrightCommand(config.packageManager, ["test"]));
    nextSteps.push(getPlaywrightCommand(config.packageManager, ["test", "--ui"]));
    nextSteps.push(getPlaywrightCommand(config.packageManager, ["codegen"]));
  } else {
    nextSteps.push(getScriptCommand(config.packageManager, "test"));
  }

  clack.outro(`🎉 Your ${config.projectName} project is ready!

Next steps:

${nextSteps.map((step) => `- ${step}`).join("\n")}

Happy testing 🚀`);
}
