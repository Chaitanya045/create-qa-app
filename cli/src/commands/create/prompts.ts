import path from "node:path";
import type { ClackModule } from "../../cli/clack";
import {
  type Architecture,
  cliConfigSchema,
  type CliConfig,
  type Framework,
  type PlaywrightReporter
} from "../../core/schema";
import type { PackageManager } from "../../core/package-manager";

const FRAMEWORK_OPTIONS: Array<{ value: Framework; label: string }> = [
  { value: "playwright", label: "Playwright" },
  { value: "cypress", label: "Cypress" }
];

const ARCHITECTURE_OPTIONS: Array<{ value: Architecture; label: string }> = [
  { value: "pom", label: "Page Object Model (POM)" },
  { value: "feature", label: "Feature Driven" }
];

const PACKAGE_MANAGER_OPTIONS: Array<{ value: PackageManager; label: string }> = [
  { value: "npm", label: "npm" },
  { value: "pnpm", label: "pnpm" },
  { value: "yarn", label: "yarn" },
  { value: "bun", label: "bun" }
];

const ZOD_OPTIONS: Array<{ value: boolean; label: string }> = [
  { value: true, label: "Yes (Recommended)" },
  { value: false, label: "No" }
];

const PLAYWRIGHT_REPORTER_OPTIONS: Array<{ value: PlaywrightReporter; label: string }> = [
  { value: "html", label: "HTML" },
  { value: "allure", label: "Allure" }
];

type PromptOptions = {
  defaultPackageManager: PackageManager;
};

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

function normalizeTestDirectory(value: string): string {
  return value.trim().replace(/\\/g, "/").replace(/^\.\/+/, "").replace(/\/+$/, "");
}

function validatePlaywrightTestDirectory(value: string | undefined): string | Error | undefined {
  const trimmedValue = (value ?? "").trim();

  if (!trimmedValue) {
    return "Test directory is required.";
  }

  if (path.isAbsolute(trimmedValue)) {
    return "Use a relative test directory path.";
  }

  const normalizedValue = normalizeTestDirectory(trimmedValue);

  if (!normalizedValue || normalizedValue === ".") {
    return "Enter a valid test directory path.";
  }

  const pathSegments = normalizedValue.split("/");
  if (pathSegments.includes("..")) {
    return "Parent directory segments are not allowed.";
  }

  return undefined;
}

export async function promptForConfig(
  clack: ClackModule,
  options: PromptOptions
): Promise<CliConfig | null> {
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

  const packageManagerInput = await clack.select<PackageManager>({
    message: "Package manager?",
    options: PACKAGE_MANAGER_OPTIONS,
    initialValue: options.defaultPackageManager
  });

  if (clack.isCancel(packageManagerInput)) {
    return null;
  }

  const useZodInput = await clack.select<boolean>({
    message: "Use Zod for runtime validation?",
    options: ZOD_OPTIONS,
    initialValue: true
  });

  if (clack.isCancel(useZodInput)) {
    return null;
  }

  let testDirectory = "tests";
  let includePlaywrightWorkflow = false;
  let playwrightReporters: PlaywrightReporter[] = ["html"];

  if (frameworkInput === "playwright") {
    const testDirectoryInput = await clack.text({
      message: "Where should your end-to-end tests live?",
      placeholder: "tests",
      initialValue: "tests",
      validate: validatePlaywrightTestDirectory
    });

    if (clack.isCancel(testDirectoryInput)) {
      return null;
    }

    testDirectory = normalizeTestDirectory(testDirectoryInput);

    const reporterSelection = await clack.multiselect<PlaywrightReporter>({
      message: "Select Playwright reporters",
      options: PLAYWRIGHT_REPORTER_OPTIONS,
      initialValues: ["html"],
      required: true
    });

    if (clack.isCancel(reporterSelection)) {
      return null;
    }

    playwrightReporters = reporterSelection;

    const includePlaywrightWorkflowInput = await clack.confirm({
      message: "Add GitHub Actions workflow?",
      initialValue: true
    });

    if (clack.isCancel(includePlaywrightWorkflowInput)) {
      return null;
    }

    includePlaywrightWorkflow = includePlaywrightWorkflowInput;
  }

  const installDepsInput = await clack.confirm({
    message: "Install dependencies?",
    initialValue: true
  });

  if (clack.isCancel(installDepsInput)) {
    return null;
  }

  if (frameworkInput === "playwright") {
    const installPlaywrightBrowsersInput = installDepsInput
      ? await clack.confirm({
          message: "Install Playwright browsers?",
          initialValue: true
        })
      : false;

    if (clack.isCancel(installPlaywrightBrowsersInput)) {
      return null;
    }

    const parsedPlaywrightConfig = cliConfigSchema.safeParse({
      projectName: projectNameInput.trim(),
      framework: frameworkInput,
      architecture: architectureInput,
      packageManager: packageManagerInput,
      useZod: useZodInput,
      installDeps: installDepsInput,
      testDirectory,
      includePlaywrightWorkflow,
      playwrightReporters,
      installPlaywrightBrowsers: installPlaywrightBrowsersInput
    });

    if (!parsedPlaywrightConfig.success) {
      throw new Error("Failed to parse the Playwright CLI configuration.");
    }

    return parsedPlaywrightConfig.data;
  }

  const parsedCypressConfig = cliConfigSchema.safeParse({
    projectName: projectNameInput.trim(),
    framework: frameworkInput,
    architecture: architectureInput,
    packageManager: packageManagerInput,
    useZod: useZodInput,
    installDeps: installDepsInput
  });

  if (!parsedCypressConfig.success) {
    throw new Error("Failed to parse the Cypress CLI configuration.");
  }

  return parsedCypressConfig.data;
}
