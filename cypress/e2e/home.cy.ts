describe("Home Page", () => {
  it("should display the welcome message", () => {
    cy.visit("/");
    cy.contains("Get started by editing").should("be.visible");
  });
});
