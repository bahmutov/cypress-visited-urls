/// <reference types="cypress" />

describe('Filter before save', () => {
  it('filters URLs for this test before saving', () => {
    cy.visit('/public/index.html')
    cy.contains('a', 'About').click()
    cy.location('pathname').should('eq', '/public/about.html')
    cy.go('back')
    cy.location('pathname').should('eq', '/public/index.html')
  })
})

after(() => {
  // this code block should run AFTER the visited urls plugin saves the urls
  // for the above test
  cy.log('after filter-before-save')
  // confirm our preprocessing using the support/e2e worked
  cy.readFile('cypress-visited-urls.json').then((allUrls) => {
    const urls =
      allUrls['cypress/e2e/filter-before-save.cy.js'][
        'Filter before save / filters URLs for this test before saving'
      ]
    expect(urls, 'saved urls for this test').to.deep.equal([
      'prefilter-save: /public/index.html',
      'prefilter-save: /public/about.html',
    ])
  })
})
