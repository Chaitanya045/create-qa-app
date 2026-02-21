import { expect, type Locator, type Page } from "@playwright/test";
import { env } from "../config/env";
import { ROUTES } from "../config/constants";
import type { AuthUser } from "{{playwrightPomAuthTypesImportPathFromPages}}";

export class LoginPage {
  public constructor(private readonly page: Page) {}

  private usernameInput(): Locator {
    return this.page.locator("#username");
  }

  private passwordInput(): Locator {
    return this.page.locator("#password");
  }

  private submitButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }

  public flashMessage(): Locator {
    return this.page.locator("#flash");
  }

  public async goto(): Promise<void> {
    await this.page.goto(ROUTES.login);
    await expect(this.usernameInput()).toBeVisible();
  }

  public async login(user: AuthUser): Promise<void> {
    await this.usernameInput().fill(user.username);
    await this.passwordInput().fill(user.password);
    await this.submitButton().click();
  }

  public async loginWithEnv(): Promise<void> {
    await this.login({ username: env.USERNAME, password: env.PASSWORD });
  }
}
