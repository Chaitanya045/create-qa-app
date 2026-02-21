import path from "node:path";
import type { ClackModule } from "../../cli/clack";
import {
  type Architecture,
  cliConfigSchema,
  type CliConfig,
  type Framework,
  type PlaywrightPomTemplate,
  type PlaywrightReporter
} from "../../core/schema";
import {
  getPackageManagerAvailability,
  getPackageManagerInstallHelp,
  type PackageManager,
  type PackageManagerAvailability
} from "../../core/package-manager";

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
  { value: false, label: "No (Keep setup simpler)" }
];

const PLAYWRIGHT_REPORTER_OPTIONS: Array<{ value: PlaywrightReporter; label: string }> = [
  { value: "html", label: "HTML" },
  { value: "allure", label: "Allure" }
];

const PLAYWRIGHT_POM_TEMPLATE_OPTIONS: Array<{ value: PlaywrightPomTemplate; label: string }> = [
  { value: "minimal", label: "Minimal" },
  { value: "advanced", label: "Advanced" }
];

type PromptOptions = {
  defaultPackageManager: PackageManager;
};

type PackageManagerOption = {
  value: PackageManager;
  label: string;
  hint?: string;
};

function getPackageManagerOptionsWithStatus(
  availability: PackageManagerAvailability
): PackageManagerOption[] {
  return PACKAGE_MANAGER_OPTIONS.map((packageManagerOption) => ({
    ...packageManagerOption,
    hint: availability[packageManagerOption.value] ? "installed" : "not installed"
  }));
}

function getInstalledPackageManagerOptions(
  availability: PackageManagerAvailability
): PackageManagerOption[] {
  return getPackageManagerOptionsWithStatus(availability).filter(
    (packageManagerOption) => availability[packageManagerOption.value]
  );
}

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

  if (normalizedValue === "src" || normalizedValue.startsWith("src/")) {
    return 'Enter a folder name without the leading "src/" (for example: "tests").';
  }

  const pathSegments = normalizedValue.split("/");
  if (pathSegments.includes("..")) {
    return "Parent directory segments are not allowed.";
  }

  return undefined;
}

function noteSectionHeader(clack: ClackModule, label: string): void {
  clack.note(`\n${label}\n`, "");
}

function noteProgress(clack: ClackModule, current: number, total: number, label: string): void {
  clack.box(`[${String(current)}/${String(total)}] ${label}`, "", {
    width: "auto",
    contentPadding: 1
  });
}

async function transitionSection(clack: ClackModule, message: string): Promise<void> {
  const spinner = clack.spinner();
  spinner.start(message);
  await new Promise((resolve) => setTimeout(resolve, 120));
  spinner.stop("");
}

export async function promptForConfig(
  clack: ClackModule,
  options: PromptOptions
): Promise<CliConfig | null> {
  const packageManagerAvailability = getPackageManagerAvailability();

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

  let pomTemplate: PlaywrightPomTemplate = "minimal";

  if (frameworkInput === "playwright" && architectureInput === "pom") {
    const pomTemplateInput = await clack.select<PlaywrightPomTemplate>({
      message: "Template?",
      options: PLAYWRIGHT_POM_TEMPLATE_OPTIONS,
      initialValue: "minimal"
    });

    if (clack.isCancel(pomTemplateInput)) {
      return null;
    }

    pomTemplate = pomTemplateInput;
  }

  const isMinimalPom =
    frameworkInput === "playwright" && architectureInput === "pom" && pomTemplate === "minimal";
  const totalSteps =
    frameworkInput === "playwright" ? (isMinimalPom ? 2 : 4) : 1;

  noteProgress(clack, 1, totalSteps, "🧰 Project setup");
  let packageManagerInput = await clack.select<PackageManager>({
    message: "Package manager?",
    options: getPackageManagerOptionsWithStatus(packageManagerAvailability),
    initialValue: options.defaultPackageManager
  });

  if (clack.isCancel(packageManagerInput)) {
    return null;
  }

  const useZodInput = await clack.select<boolean>({
    message: "Use Zod for runtime validation?",
    options: ZOD_OPTIONS,
    initialValue: isMinimalPom ? false : true
  });

  if (clack.isCancel(useZodInput)) {
    return null;
  }

  let testDirectory = "tests";
  let includePlaywrightWorkflow = false;
  let playwrightReporters: PlaywrightReporter[] = ["html"];
  let useSrcLayout = true;

  if (frameworkInput === "playwright") {
    clack.log.success("✅ Project setup complete");
    await transitionSection(clack, "⏳ Preparing testing setup...");
    noteProgress(clack, 2, totalSteps, "🧪 Testing setup");
    const testDirectoryInput = await clack.text({
      message: "Where should your end-to-end tests live?",
      placeholder: "tests",
      initialValue: "tests",
      validate: validatePlaywrightTestDirectory
    });

    if (clack.isCancel(testDirectoryInput)) {
      return null;
    }

    const normalizedTestDirectory = normalizeTestDirectory(testDirectoryInput);

    const useSrcLayoutInput = await clack.confirm({
      message: "Keep everything under src/?",
      initialValue: true
    });

    if (clack.isCancel(useSrcLayoutInput)) {
      return null;
    }

    useSrcLayout = useSrcLayoutInput;
    testDirectory = useSrcLayout ? `src/${normalizedTestDirectory}` : normalizedTestDirectory;

    clack.log.success("✅ Testing setup complete");
    // Skip report selection for minimal POM; use default HTML only
    if (!(architectureInput === "pom" && pomTemplate === "minimal")) {
      await transitionSection(clack, "⏳ Preparing reporting...");
      noteProgress(clack, 3, totalSteps, "📊 Reporting");
      const reporterSelection = await clack.multiselect<PlaywrightReporter>({
        message: "Select reporters (Space to toggle • Enter to confirm)",
        options: PLAYWRIGHT_REPORTER_OPTIONS,
        initialValues: ["html"],
        required: true
      });

      if (clack.isCancel(reporterSelection)) {
        return null;
      }

      playwrightReporters = reporterSelection;

      clack.log.success("✅ Reporting complete");
    }
    // Skip CI tooling for minimal POM; no workflow by default
    if (!(architectureInput === "pom" && pomTemplate === "minimal")) {
      await transitionSection(clack, "⏳ Preparing CI / tooling...");
      noteProgress(clack, 4, totalSteps, "🔧 CI / Tooling");
      const includePlaywrightWorkflowInput = await clack.confirm({
        message: "Add GitHub Actions workflow?",
        initialValue: true
      });

      if (clack.isCancel(includePlaywrightWorkflowInput)) {
        return null;
      }

      includePlaywrightWorkflow = includePlaywrightWorkflowInput;
    }
  }

  if (frameworkInput === "cypress") {
    clack.log.success("✅ Project setup complete");
  }

  let installDepsInput = await clack.confirm({
    message: "Install dependencies?",
    initialValue: true
  });

  if (clack.isCancel(installDepsInput)) {
    return null;
  }

  if (installDepsInput && !packageManagerAvailability[packageManagerInput]) {
    clack.note(
      `Selected package manager "${packageManagerInput}" is not installed.

Install it globally and rerun:
  ${getPackageManagerInstallHelp(packageManagerInput)}`,
      "Package manager unavailable"
    );

    const installedPackageManagerOptions = getInstalledPackageManagerOptions(packageManagerAvailability);

    if (installedPackageManagerOptions.length === 0) {
      clack.log.warn(
        "No supported package managers were detected. Continuing without dependency installation."
      );
      installDepsInput = false;
    } else {
      const missingPackageManagerAction = await clack.select<"reselect" | "skip">({
        message: "How would you like to continue?",
        options: [
          { value: "reselect", label: "Select another package manager (Recommended)" },
          { value: "skip", label: "Skip dependency install and finish scaffolding" }
        ],
        initialValue: "reselect"
      });

      if (clack.isCancel(missingPackageManagerAction)) {
        return null;
      }

      if (missingPackageManagerAction === "reselect") {
        const replacementInitialValue =
          installedPackageManagerOptions.find(
            (installedPackageManagerOption) =>
              installedPackageManagerOption.value === options.defaultPackageManager
          )?.value ?? installedPackageManagerOptions[0]?.value;

        const replacementPackageManagerInput = await clack.select<PackageManager>({
          message: "Select an installed package manager",
          options: installedPackageManagerOptions,
          initialValue: replacementInitialValue
        });

        if (clack.isCancel(replacementPackageManagerInput)) {
          return null;
        }

        packageManagerInput = replacementPackageManagerInput;
      } else {
        installDepsInput = false;
      }
    }
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
      useSrcLayout,
      pomTemplate,
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
