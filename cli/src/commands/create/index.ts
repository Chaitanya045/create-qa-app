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

  const config = await promptForConfig(clack);

  if (!config) {
    clack.cancel("Operation cancelled.");
    return;
  }

  const spinner = clack.spinner();
  const packageManager = detectPackageManager(process.cwd());

  try {
    spinner.start("Scaffolding project...");
    const scaffoldResult = await scaffoldProject(process.cwd(), config);
    spinner.stop(
      `Created ${path.basename(scaffoldResult.targetDir)} with ${String(scaffoldResult.createdFiles)} files.`
    );

    if (config.installDeps) {
      spinner.start(`Installing dependencies using ${packageManager}...`);
      await installDependencies(scaffoldResult.targetDir, packageManager);
      spinner.stop("Dependencies installed.");
    }
  } catch (error) {
    spinner.stop("Project setup failed.");
    clack.cancel(getErrorMessage(error));
    process.exit(1);
  }

  const nextSteps = [`cd ${config.projectName}`];

  if (!config.installDeps) {
    nextSteps.push(getInstallCommand(packageManager));
  }

  nextSteps.push(getScriptCommand(packageManager, "test"));

  clack.outro(`Project ready.

Next steps:
  ${nextSteps.join("\n  ")}`);
}
