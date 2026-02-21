import { test as base, expect } from "@playwright/test";
import { LoginPage } from "{{playwrightPomLoginPageImportPathFromFixtures}}";
import { SecurePage } from "{{playwrightPomSecurePageImportPathFromFixtures}}";

type Fixtures = {
  loginPage: LoginPage;
  securePage: SecurePage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  securePage: async ({ page }, use) => {
    await use(new SecurePage(page));
  }
});

export { expect };
