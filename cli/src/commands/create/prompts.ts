import type { ClackModule } from "../../cli/clack";
import {
  type Architecture,
  cliConfigSchema,
  type CliConfig,
  type Framework
} from "../../core/schema";

const FRAMEWORK_OPTIONS: Array<{ value: Framework; label: string }> = [
  { value: "playwright", label: "Playwright" },
  { value: "cypress", label: "Cypress" }
];

const ARCHITECTURE_OPTIONS: Array<{ value: Architecture; label: string }> = [
  { value: "pom", label: "Page Object Model (POM)" },
  { value: "feature", label: "Feature Driven" }
];

function validateProjectName(value: string | undefined): string | Error | undefined {
  const trimmedValue = (value ?? "").trim();

  if (!trimmedValue) {
    return "Project name is required.";
  }

  if (trimmedValue === "." || trimmedValue === "..") {
    return "Choose a real folder name.";
  }

  if (trimmedValue.includes("/") || trimmedValue.includes("\\")) {
    return "Use a single folder name, not a path.";
  }

  return undefined;
}

export async function promptForConfig(clack: ClackModule): Promise<CliConfig | null> {
  const projectNameInput = await clack.text({
    message: "Project name?",
    placeholder: "my-test-project",
    validate: validateProjectName
  });

  if (clack.isCancel(projectNameInput)) {
    return null;
  }

  const frameworkInput = await clack.select<Framework>({
    message: "Framework?",
    options: FRAMEWORK_OPTIONS
  });

  if (clack.isCancel(frameworkInput)) {
    return null;
  }

  const architectureInput = await clack.select<Architecture>({
    message: "Architecture?",
    options: ARCHITECTURE_OPTIONS
  });

  if (clack.isCancel(architectureInput)) {
    return null;
  }

  const installDepsInput = await clack.confirm({
    message: "Install dependencies?",
    initialValue: true
  });

  if (clack.isCancel(installDepsInput)) {
    return null;
  }

  const parsedConfig = cliConfigSchema.safeParse({
    projectName: projectNameInput.trim(),
    framework: frameworkInput,
    architecture: architectureInput,
    installDeps: installDepsInput
  });

  if (!parsedConfig.success) {
    throw new Error("Failed to parse the CLI configuration.");
  }

  return parsedConfig.data;
}
