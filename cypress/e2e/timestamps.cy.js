/// <reference types="cypress" />

describe('Timestamps', () => {
  it('measures time spent at each page', () => {
    cy.visit('/public/index.html').wait(300)
    cy.contains('a', 'About').click()
    cy.location('pathname')
      .should('eq', '/public/about.html')
      .wait(50)
    cy.go('back')
    cy.location('pathname').should('eq', '/public/index.html')
    cy.contains('h1', 'Homepage')
  })
})

after(() => {
  // this code block should run AFTER the visited urls plugin saves the urls
  // for the above test
  cy.log('after the plugin saved visited URLs')
  cy.log('confirm we collected the durations')
  cy.readFile('cypress-visited-urls.json').then((allUrls) => {
    const urls =
      allUrls['cypress/e2e/timestamps.cy.js'][
        'Timestamps / measures time spent at each page'
      ]
    expect(urls, 'two visited pages').to.have.length(2)
    expect(urls[0], 'the longest visited page').to.have.keys([
      'url',
      'duration',
    ])
    expect(urls[0].url, 'the longest page URL').to.equal(
      '/public/index.html',
    )
    expect(urls[0].duration, 'total time spent').to.be.within(
      300,
      500,
    )

    expect(urls[1].url, 'the second page URL').to.equal(
      '/public/about.html',
    )
    expect(urls[1].duration, 'total time spent').to.be.within(50, 150)
  })
})
