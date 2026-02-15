import { HomePage } from "../support/pages/home.page";

describe("home smoke test", () => {
  it("shows docs links", () => {
    const homePage = new HomePage();
    homePage.visit();
    homePage.expectTypeLink();
  });
});
