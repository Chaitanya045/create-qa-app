import { expect, type Locator, type Page } from "@playwright/test";
import { ROUTES } from "../config/constants";
import { testData } from "../data/test-data";

export class SecurePage {
  public constructor(private readonly page: Page) {}

  public async goto(): Promise<void> {
    await this.page.goto(ROUTES.secure);
  }

  public header(): Locator {
    return this.page.getByRole("heading", { name: "Secure Area", level: 2, exact: true });
  }

  public flashMessage(): Locator {
    return this.page.locator("#flash");
  }

  public logoutButton(): Locator {
    return this.page.getByRole("link", { name: /logout/i });
  }

  public async expectLoggedIn(): Promise<void> {
    await expect(this.header()).toBeVisible();
    await expect(this.flashMessage()).toContainText(testData.expectedLoginSuccessMessage);
  }
}
