import { type Locator, type Page } from "@playwright/test";
import { ROUTES } from "{{playwrightPomConstantsImportPathFromPages}}";
import { normalizePath } from "{{playwrightPomHelpersImportPathFromPages}}";
import { testData } from "{{playwrightPomTestDataImportPathFromPages}}";

export class ExamplePage {
  public constructor(private readonly page: Page) {}

  public async goto(): Promise<void> {
    await this.page.goto(normalizePath(ROUTES.home));
  }

  public getGettingStartedLink(): Locator {
    return this.page.getByRole("link", { name: testData.gettingStartedLinkText });
  }
}

