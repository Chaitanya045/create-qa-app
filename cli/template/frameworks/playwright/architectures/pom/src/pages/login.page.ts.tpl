import { expect, type Locator, type Page } from "@playwright/test";
import { env } from "../config/env";
import { ROUTES } from "../config/constants";
import type { AuthUser } from "{{playwrightPomAuthTypesImportPathFromPages}}";

export class LoginPage {
  private readonly page: Page;

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly flashMessage: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.usernameInput = page.locator("#username");
    this.passwordInput = page.locator("#password");
    this.submitButton = page.locator('button[type="submit"]');
    this.flashMessage = page.locator("#flash");
  }

  public async goto(): Promise<void> {
    await this.page.goto(ROUTES.login);
    await expect(this.usernameInput).toBeVisible();
  }

  public async login(user: AuthUser): Promise<void> {
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.submitButton.click();
  }

  public async loginWithEnv(): Promise<void> {
    await this.login({ username: env.USERNAME, password: env.PASSWORD });
  }
}
