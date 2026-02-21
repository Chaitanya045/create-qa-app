import { type Locator, type Page } from "@playwright/test";

export class HomeFeature {
  private readonly page: Page;

  readonly formAuthenticationLink: Locator;

  public constructor(page: Page) {
    this.page = page;

    this.formAuthenticationLink = page.getByRole("link", {
      name: "Form Authentication",
      exact: true
    });
  }

  public async visitHome(): Promise<void> {
    await this.page.goto("/");
  }
}
