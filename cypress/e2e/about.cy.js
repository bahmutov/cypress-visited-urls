/// <reference types="cypress" />

describe('The about page', () => {
  it('goes using the link', () => {
    cy.visit('/public/index.html')
    cy.contains('a', 'About').click()
    cy.location('pathname').should('eq', '/about.html')
    cy.go('back')
    cy.location('pathname').should('eq', '/index.html')
  })
})
