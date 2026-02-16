import type { Architecture, CliConfig, Framework } from "../core/schema";
import { getInstallCommand, getScriptCommand } from "../core/package-manager";

export type TemplateAsset = {
  source: string;
  destination: string;
};

export type TemplateManifest = {
  assets: TemplateAsset[];
  variables: Record<string, string>;
};

const SHARED_ASSETS: TemplateAsset[] = [
  {
    source: "base/common/.gitignore.tpl",
    destination: ".gitignore"
  }
];

const PLAYWRIGHT_BASE_ASSETS: TemplateAsset[] = [
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

const ARCHITECTURE_ASSETS: Record<Framework, Record<Architecture, TemplateAsset[]>> = {
  playwright: {
    pom: [
      {
        source: "frameworks/playwright/architectures/pom/src/pages/home.page.ts.tpl",
        destination: "src/pages/home.page.ts"
      },
      {
        source: "frameworks/playwright/architectures/pom/tests/home.spec.ts.tpl",
        destination: "tests/home.spec.ts"
      }
    ],
    feature: [
      {
        source: "frameworks/playwright/architectures/feature/tests/home/home.page.ts.tpl",
        destination: "tests/home/home.page.ts"
      },
      {
        source: "frameworks/playwright/architectures/feature/tests/home/home.spec.ts.tpl",
        destination: "tests/home/home.spec.ts"
      }
    ]
  },
  cypress: {
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
  }
};

function getFrameworkAssets(config: CliConfig): TemplateAsset[] {
  if (config.framework === "playwright") {
    return [
      {
        source: config.useZod
          ? "frameworks/playwright/package.json.tpl"
          : "frameworks/playwright/package.no-zod.json.tpl",
        destination: "package.json"
      },
      {
        source: config.useZod
          ? "frameworks/playwright/src/config/env.ts.tpl"
          : "frameworks/playwright/src/config/env.no-zod.ts.tpl",
        destination: "src/config/env.ts"
      },
      ...PLAYWRIGHT_BASE_ASSETS
    ];
  }

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
    ...CYPRESS_BASE_ASSETS
  ];
}

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

export function createTemplateManifest(config: CliConfig): TemplateManifest {
  return {
    assets: [
      ...SHARED_ASSETS,
      ...getFrameworkAssets(config),
      ...ARCHITECTURE_ASSETS[config.framework][config.architecture]
    ],
    variables: {
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
    }
  };
}
