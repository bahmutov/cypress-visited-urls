/// <reference types="cypress" />

describe('The home page', () => {
  it('goes using the link', () => {
    cy.visit('/public/index.html')
    cy.contains('h1', 'Homepage')
  })
})
