export class HomePage {
  public visit(): void {
    cy.visit("/");
  }

  public expectTypeLink(): void {
    cy.contains("type").should("be.visible");
  }
}
