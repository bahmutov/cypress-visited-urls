/// <reference types="cypress" />

describe('filtering URLs', () => {
  it('filters query parameters', () => {
    cy.visit('/public/index.html?foo=bar').then(() => {
      const urls = Cypress.env('visitedUrlsSet').values().toArray()
      expect(urls, 'urls').to.deep.equal(['/public/index.html'])
    })
  })
})
