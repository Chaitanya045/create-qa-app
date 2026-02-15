import { homeFeature } from "./home.fixture";

describe("home feature smoke test", () => {
  it("shows docs links", () => {
    cy.visit(homeFeature.route);
    cy.contains(homeFeature.expectedLinkText).should("be.visible");
  });
});
