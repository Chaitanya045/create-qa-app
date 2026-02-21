import { type Locator, type Page } from "@playwright/test";

export class HomePage {
  private readonly page: Page;

  readonly formAuthenticationLink: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.formAuthenticationLink = page.getByRole("link", {
      name: "Form Authentication",
      exact: true
    });
  }

  public async goto(): Promise<void> {
    await this.page.goto("/");
  }
}
