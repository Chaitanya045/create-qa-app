import path from "node:path";
import { loadClack } from "../../cli/clack";
import { promptForConfig } from "./prompts";
import { installDependencies } from "../../core/install";
import {
  detectPackageManager,
  getInstallCommand,
  getScriptCommand
} from "../../core/package-manager";
import { scaffoldProject } from "../../core/scaffold";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error while creating the project.";
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

  try {
    spinner.start("Scaffolding project...");
    const scaffoldResult = await scaffoldProject(process.cwd(), config);
    spinner.stop(
      `Created ${path.basename(scaffoldResult.targetDir)} with ${String(scaffoldResult.createdFiles)} files.`
    );

    if (config.installDeps) {
      spinner.start(`Installing dependencies using ${config.packageManager}...`);
      await installDependencies(scaffoldResult.targetDir, config.packageManager);
      spinner.stop("Dependencies installed.");
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

  nextSteps.push(getScriptCommand(config.packageManager, "test"));

  clack.outro(`Project ready.

Next steps:
  ${nextSteps.join("\n  ")}`);
}
