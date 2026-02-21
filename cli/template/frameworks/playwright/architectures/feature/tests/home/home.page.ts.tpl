import { type Locator, type Page } from "@playwright/test";

export class HomeFeature {
  public constructor(private readonly page: Page) {}

  public async visitHome(): Promise<void> {
    await this.page.goto("/");
  }

  public formAuthenticationLink(): Locator {
    return this.page.getByRole("link", { name: "Form Authentication", exact: true });
  }
}
