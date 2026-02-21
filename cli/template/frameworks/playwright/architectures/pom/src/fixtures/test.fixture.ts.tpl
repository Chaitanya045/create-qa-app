import { test as base, expect } from "@playwright/test";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { LoginPage } from "{{playwrightPomLoginPageImportPathFromFixtures}}";
import { SecurePage } from "{{playwrightPomSecurePageImportPathFromFixtures}}";

type Fixtures = {
  loginPage: LoginPage;
  securePage: SecurePage;
};

type WorkerFixtures = {
  workerStorageState: string;
};

export const test = base.extend<Fixtures, WorkerFixtures>({
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  workerStorageState: [
    async ({ browser }, use, workerInfo) => {
      const id = workerInfo.parallelIndex;
      const fileName = path.resolve(workerInfo.project.outputDir, `.auth/${id}.json`);

      if (existsSync(fileName)) {
        await use(fileName);
        return;
      }

      mkdirSync(path.dirname(fileName), { recursive: true });

      const baseURL = workerInfo.project.use.baseURL;
      if (typeof baseURL !== "string" || baseURL.length === 0) {
        throw new Error("baseURL must be configured to run worker-scoped auth.");
      }

      const context = await browser.newContext({
        baseURL,
        storageState: undefined,
        locale:
          typeof workerInfo.project.use.locale === "string"
            ? workerInfo.project.use.locale
            : undefined,
        userAgent:
          typeof workerInfo.project.use.userAgent === "string"
            ? workerInfo.project.use.userAgent
            : undefined
      });

      const page = await context.newPage();

      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.loginWithEnv();

      const securePage = new SecurePage(page);
      await securePage.expectLoggedIn();

      await context.storageState({ path: fileName });
      await context.close();

      await use(fileName);
    },
    { scope: "worker" }
  ],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  securePage: async ({ page }, use) => {
    await use(new SecurePage(page));
  }
});

export { expect };
