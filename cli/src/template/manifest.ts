import path from "node:path";
import type {
  Architecture,
  CliConfig,
  CypressCliConfig,
  Framework,
  PlaywrightCliConfig
} from "../core/schema";
import {
  getBinaryCommand,
  getInstallCommand,
  getPlaywrightCommand,
  getPlaywrightInstallBrowsersCommand,
  getScriptCommand
} from "../core/package-manager";
import type { ResolvedVersions } from "../core/version-resolver";

export type TemplateAsset = {
  source: string;
  destination: string;
};

export type TemplateManifest = {
  assets: TemplateAsset[];
  variables: Record<string, string>;
};

export type TemplateManifestOptions = {
  resolvedVersions: ResolvedVersions;
};

const SHARED_ASSETS: TemplateAsset[] = [
  {
    source: "base/common/.gitignore.tpl",
    destination: ".gitignore"
  }
];

const CYPRESS_BASE_ASSETS: TemplateAsset[] = [
  {
    source: "frameworks/cypress/tsconfig.json.tpl",
    destination: "tsconfig.json"
  },
  {
    source: "frameworks/cypress/README.md.tpl",
    destination: "README.md"
  },
  {
    source: "frameworks/cypress/cypress.config.ts.tpl",
    destination: "cypress.config.ts"
  },
  {
    source: "frameworks/cypress/cypress/support/e2e.ts.tpl",
    destination: "cypress/support/e2e.ts"
  }
];

const CYPRESS_ARCHITECTURE_ASSETS: Record<Architecture, TemplateAsset[]> = {
  pom: [
    {
      source: "frameworks/cypress/architectures/pom/cypress/support/pages/home.page.ts.tpl",
      destination: "cypress/support/pages/home.page.ts"
    },
    {
      source: "frameworks/cypress/architectures/pom/cypress/e2e/home.cy.ts.tpl",
      destination: "cypress/e2e/home.cy.ts"
    }
  ],
  feature: [
    {
      source: "frameworks/cypress/architectures/feature/cypress/e2e/home/home.fixture.ts.tpl",
      destination: "cypress/e2e/home/home.fixture.ts"
    },
    {
      source: "frameworks/cypress/architectures/feature/cypress/e2e/home/home.cy.ts.tpl",
      destination: "cypress/e2e/home/home.cy.ts"
    }
  ]
};

function toPackageName(projectName: string): string {
  const normalized = projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "qa-project";
}

function getFrameworkLabel(framework: Framework): string {
  return framework === "playwright" ? "Playwright" : "Cypress";
}

function getArchitectureLabel(architecture: Architecture): string {
  return architecture === "pom" ? "Page Object Model (POM)" : "Feature Driven";
}

function getResolvedVersion(
  packageName: string,
  templateManifestOptions: TemplateManifestOptions
): string {
  return templateManifestOptions.resolvedVersions[packageName] ?? "latest";
}

function formatDependencyLine(packageName: string, version: string): string {
  return `,\n    "${packageName}": "${version}"`;
}

function formatPlaywrightReporterConfig(config: PlaywrightCliConfig): string {
  const reporterEntries: string[] = ['["line"]'];

  if (config.playwrightReporters.includes("html")) {
    reporterEntries.push('["html", { open: "never" }]');
  }

  if (config.playwrightReporters.includes("allure")) {
    reporterEntries.push('["allure-playwright"]');
  }

  return `[${reporterEntries.join(", ")}]`;
}

function formatCommandList(commands: string[]): string {
  return commands.map((command) => `- \`${command}\``).join("\n");
}

function getPlaywrightWorkflowTemplate(config: PlaywrightCliConfig): string {
  if (config.playwrightReporters.includes("html") && config.playwrightReporters.includes("allure")) {
    return "frameworks/playwright/.github/workflows/playwright.workflow.html-allure.yml.tpl";
  }

  if (config.playwrightReporters.includes("allure")) {
    return "frameworks/playwright/.github/workflows/playwright.workflow.allure.yml.tpl";
  }

  return "frameworks/playwright/.github/workflows/playwright.workflow.html.yml.tpl";
}

function getPlaywrightPomPageImportPath(testDirectory: string, pageModulePath: string): string {
  const fromDirectory = testDirectory.replace(/\\/g, "/");
  const relativePath = path.posix.relative(fromDirectory, pageModulePath);
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

function getPlaywrightArchitectureAssets(config: PlaywrightCliConfig): TemplateAsset[] {
  if (config.architecture === "pom") {
    const pagesDestinationRoot = config.useSrcLayout ? "src/pages" : "pages";
    return [
      {
        source: "frameworks/playwright/architectures/pom/src/pages/home.page.ts.tpl",
        destination: `${pagesDestinationRoot}/home.page.ts`
      },
      {
        source: "frameworks/playwright/architectures/pom/tests/home.spec.ts.tpl",
        destination: `${config.testDirectory}/home.spec.ts`
      }
    ];
  }

  return [
    {
      source: "frameworks/playwright/architectures/feature/tests/home/home.page.ts.tpl",
      destination: `${config.testDirectory}/home/home.page.ts`
    },
    {
      source: "frameworks/playwright/architectures/feature/tests/home/home.spec.ts.tpl",
      destination: `${config.testDirectory}/home/home.spec.ts`
    }
  ];
}

function getPlaywrightAssets(config: PlaywrightCliConfig): TemplateAsset[] {
  const configDestinationRoot = config.useSrcLayout ? "src/config" : "config";
  const assets: TemplateAsset[] = [
    {
      source: "frameworks/playwright/package.json.tpl",
      destination: "package.json"
    },
    {
      source: "frameworks/playwright/.husky/pre-commit.tpl",
      destination: ".husky/pre-commit"
    },
    {
      source: "frameworks/playwright/eslint.config.js.tpl",
      destination: "eslint.config.js"
    },
    {
      source: "frameworks/playwright/.prettierrc.json.tpl",
      destination: ".prettierrc.json"
    },
    {
      source: "frameworks/playwright/.prettierignore.tpl",
      destination: ".prettierignore"
    },
    {
      source: "frameworks/playwright/tsconfig.json.tpl",
      destination: "tsconfig.json"
    },
    {
      source: "frameworks/playwright/README.md.tpl",
      destination: "README.md"
    },
    {
      source: "frameworks/playwright/playwright.config.ts.tpl",
      destination: "playwright.config.ts"
    },
    {
      source: config.useZod
        ? "frameworks/playwright/src/config/env.ts.tpl"
        : "frameworks/playwright/src/config/env.no-zod.ts.tpl",
      destination: `${configDestinationRoot}/env.ts`
    },
    ...getPlaywrightArchitectureAssets(config)
  ];

  if (config.includePlaywrightWorkflow) {
    assets.push({
      source: getPlaywrightWorkflowTemplate(config),
      destination: ".github/workflows/playwright.yml"
    });
  }

  return assets;
}

function getPlaywrightVariables(
  config: PlaywrightCliConfig,
  templateManifestOptions: TemplateManifestOptions
): Record<string, string> {
  const hasHtml = config.playwrightReporters.includes("html");
  const hasAllure = config.playwrightReporters.includes("allure");
  const htmlReportCommand = getScriptCommand(config.packageManager, "report:html");
  const allureReportCommand = getScriptCommand(config.packageManager, "report:allure");
  const reportCommands: string[] = [];

  if (hasHtml) {
    reportCommands.push(htmlReportCommand);
  }

  if (hasAllure) {
    reportCommands.push(allureReportCommand);
  }

  const pagesModuleRoot = config.useSrcLayout ? "src/pages" : "pages";

  return {
    projectName: config.projectName,
    packageName: toPackageName(config.projectName),
    frameworkLabel: getFrameworkLabel(config.framework),
    architectureLabel: getArchitectureLabel(config.architecture),
    runtimeValidationLabel: config.useZod ? "Zod" : "None",
    installCommand: getInstallCommand(config.packageManager),
    typecheckCommand: getScriptCommand(config.packageManager, "typecheck"),
    testCommand: getScriptCommand(config.packageManager, "test"),
    lintCommand: getScriptCommand(config.packageManager, "lint"),
    lintFixCommand: getScriptCommand(config.packageManager, "lint:fix"),
    formatCommand: getScriptCommand(config.packageManager, "format"),
    formatCheckCommand: getScriptCommand(config.packageManager, "format:check"),
    openCommand: getScriptCommand(config.packageManager, "test:open"),
    uiCommand: getPlaywrightCommand(config.packageManager, ["test", "--ui"]),
    htmlReportCommand,
    allureReportCommand,
    playwrightReportCommandsList: formatCommandList(reportCommands),
    playwrightRunTestsCommand: getPlaywrightCommand(config.packageManager, ["test"]),
    playwrightUiModeCommand: getPlaywrightCommand(config.packageManager, ["test", "--ui"]),
    playwrightProjectCommand: getPlaywrightCommand(config.packageManager, ["test", "--project=chromium"]),
    playwrightDebugCommand: getPlaywrightCommand(config.packageManager, ["test", "--debug"]),
    playwrightCodegenCommand: getPlaywrightCommand(config.packageManager, ["codegen"]),
    playwrightInstallBrowsersCommand: getPlaywrightInstallBrowsersCommand(config.packageManager, false),
    playwrightInstallBrowsersWithDepsCommand: getPlaywrightInstallBrowsersCommand(
      config.packageManager,
      true
    ),
    playwrightWorkflowInstallCommand: getInstallCommand(config.packageManager),
    playwrightWorkflowTestCommand: getPlaywrightCommand(config.packageManager, ["test"]),
    playwrightWorkflowAllureGenerateCommand: getBinaryCommand(config.packageManager, "allure", [
      "generate",
      "allure-results",
      "--clean",
      "-o",
      "allure-report"
    ]),
    playwrightTestDirectory: config.testDirectory,
    playwrightReporterConfig: formatPlaywrightReporterConfig(config),
    playwrightSelectedReportersList: formatCommandList(
      config.playwrightReporters.map((reporter) => (reporter === "html" ? "HTML" : "Allure"))
    ),
    playwrightEnvImportPath: config.useSrcLayout ? "./src/config/env" : "./config/env",
    playwrightPomPageImportPath: getPlaywrightPomPageImportPath(
      config.testDirectory,
      `${pagesModuleRoot}/home.page`
    ),
    versionEslint: getResolvedVersion("eslint", templateManifestOptions),
    versionEslintJs: getResolvedVersion("@eslint/js", templateManifestOptions),
    versionEslintConfigPrettier: getResolvedVersion("eslint-config-prettier", templateManifestOptions),
    versionEslintPluginPlaywright: getResolvedVersion(
      "eslint-plugin-playwright",
      templateManifestOptions
    ),
    versionHusky: getResolvedVersion("husky", templateManifestOptions),
    versionLintStaged: getResolvedVersion("lint-staged", templateManifestOptions),
    versionPrettier: getResolvedVersion("prettier", templateManifestOptions),
    versionTypescriptEslint: getResolvedVersion("typescript-eslint", templateManifestOptions),
    versionPlaywrightTest: getResolvedVersion("@playwright/test", templateManifestOptions),
    versionTypesNode: getResolvedVersion("@types/node", templateManifestOptions),
    versionTypescript: getResolvedVersion("typescript", templateManifestOptions),
    playwrightHtmlScriptLine: hasHtml ? ',\n    "report:html": "playwright show-report"' : "",
    playwrightZodDependencyLine: config.useZod
      ? formatDependencyLine("zod", getResolvedVersion("zod", templateManifestOptions))
      : "",
    playwrightAllureScriptLine: hasAllure
      ? ',\n    "report:allure": "allure generate allure-results --clean && allure open"'
      : "",
    playwrightAllurePlaywrightDependencyLine: hasAllure
      ? formatDependencyLine(
          "allure-playwright",
          getResolvedVersion("allure-playwright", templateManifestOptions)
        )
      : "",
    playwrightAllureCommandlineDependencyLine: hasAllure
      ? formatDependencyLine(
          "allure-commandline",
          getResolvedVersion("allure-commandline", templateManifestOptions)
        )
      : ""
  };
}

function getCypressAssets(config: CypressCliConfig): TemplateAsset[] {
  return [
    {
      source: config.useZod
        ? "frameworks/cypress/package.json.tpl"
        : "frameworks/cypress/package.no-zod.json.tpl",
      destination: "package.json"
    },
    {
      source: config.useZod
        ? "frameworks/cypress/cypress/support/env.ts.tpl"
        : "frameworks/cypress/cypress/support/env.no-zod.ts.tpl",
      destination: "cypress/support/env.ts"
    },
    ...CYPRESS_BASE_ASSETS,
    ...CYPRESS_ARCHITECTURE_ASSETS[config.architecture]
  ];
}

function getCypressVariables(config: CypressCliConfig): Record<string, string> {
  return {
    projectName: config.projectName,
    packageName: toPackageName(config.projectName),
    frameworkLabel: getFrameworkLabel(config.framework),
    architectureLabel: getArchitectureLabel(config.architecture),
    runtimeValidationLabel: config.useZod ? "Zod" : "None",
    installCommand: getInstallCommand(config.packageManager),
    typecheckCommand: getScriptCommand(config.packageManager, "typecheck"),
    testCommand: getScriptCommand(config.packageManager, "test"),
    openCommand: getScriptCommand(config.packageManager, "test:open"),
    uiCommand: getScriptCommand(config.packageManager, "test:ui"),
    htmlReportCommand: getScriptCommand(config.packageManager, "report:html"),
    allureReportCommand: getScriptCommand(config.packageManager, "report:allure")
  };
}

export function createTemplateManifest(
  config: CliConfig,
  templateManifestOptions: TemplateManifestOptions
): TemplateManifest {
  if (config.framework === "playwright") {
    return {
      assets: [...SHARED_ASSETS, ...getPlaywrightAssets(config)],
      variables: getPlaywrightVariables(config, templateManifestOptions)
    };
  }

  return {
    assets: [...SHARED_ASSETS, ...getCypressAssets(config)],
    variables: getCypressVariables(config)
  };
}
