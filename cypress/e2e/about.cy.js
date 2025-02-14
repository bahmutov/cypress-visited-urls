/// <reference types="cypress" />

describe('The about page', () => {
  it('goes using the link', () => {
    cy.visit('/public/index.html')
    cy.contains('a', 'About').click()
    cy.location('pathname').should('eq', '/public/about.html')
    cy.go('back')
    cy.location('pathname')
      .should('eq', '/public/index.html')
      .log('**check collected urls**')
      .then(() => {
        const urls = Cypress.env('visitedUrlsSet').values().toArray()
        expect(urls, 'urls').to.deep.equal([
          '/public/index.html',
          '/public/about.html',
        ])
      })
  })
})
