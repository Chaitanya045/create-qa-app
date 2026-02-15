import { expect, type Page } from "@playwright/test";

export class HomePage {
  public constructor(private readonly page: Page) {}

  public async goto(): Promise<void> {
    await this.page.goto("/");
  }

  public async expectGettingStartedLink(): Promise<void> {
    await expect(this.page.getByRole("link", { name: "Get started" })).toBeVisible();
  }
}
