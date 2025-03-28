/// <reference types="cypress" />

import spok from 'cy-spok'

describe('Recorded test events', () => {
  it('adds custom events to the test record set', () => {
    cy.visit('/public/index.html')
      .wait(300)
      .then(() => {
        Cypress.addVisitedTestEvent({
          label: 'custom-event',
          data: {
            message: 'hello',
          },
        })
      })
    cy.contains('a', 'About')
      .click()
      .then(() => {
        // the second matching event should not be added
        Cypress.addVisitedTestEvent({
          label: 'custom-event',
          data: {
            message: 'hello',
          },
        })
      })
    cy.location('pathname')
      .should('eq', '/public/about.html')
      .wait(50)
    cy.go('back')
    cy.location('pathname').should('eq', '/public/index.html')
    cy.contains('h1', 'Homepage').then(() => {
      Cypress.addVisitedTestEvent({
        label: 'navigation',
        data: 'back to homepage',
      })
    })
  })
})

after(() => {
  // this code block should run AFTER the visited urls plugin saves the urls
  // for the above test
  cy.log('checking the recorded test events')
  cy.log('confirm we collected the durations')
  cy.readFile('cypress-visited-urls.json')
    .then((allUrls) => {
      const testData =
        allUrls['cypress/e2e/test-events.cy.js'][
          'Recorded test events / adds custom events to the test record set'
        ]
      expect(testData, 'test data').to.have.keys([
        'urls',
        'testEvents',
      ])
      return testData.testEvents
    })
    .should('have.length', 2)
    .and(
      spok([
        {
          label: 'custom-event',
          data: {
            message: 'hello',
          },
        },
        {
          label: 'navigation',
          data: 'back to homepage',
        },
      ]),
    )
})
