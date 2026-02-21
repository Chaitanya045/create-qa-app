import { expect, type Locator, type Page } from "@playwright/test";
import { ROUTES } from "../config/constants";
import { testData } from "../data/test-data";

export class SecurePage {
  private readonly page: Page;

  readonly header: Locator;
  readonly flashMessage: Locator;
  readonly logoutButton: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.header = page.getByRole("heading", { name: "Secure Area", level: 2, exact: true });
    this.flashMessage = page.locator("#flash");
    this.logoutButton = page.getByRole("link", { name: /logout/i });
  }

  public async goto(): Promise<void> {
    await this.page.goto(ROUTES.secure);
  }

  public async expectLoggedIn(): Promise<void> {
    await expect(this.header).toBeVisible();
    await expect(this.flashMessage).toContainText(testData.expectedLoginSuccessMessage);
  }
}
