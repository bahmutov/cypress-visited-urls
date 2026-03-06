/// <reference types="cypress" />

chai.config.truncateThreshold = 0

import spok from 'cy-spok'
import { title } from 'process'

describe('Command counts', () => {
  it.only('counts commands per page', { retries: 0 }, () => {
    cy.visit('/public/index.html').then(() => {
      const commandCounts = Cypress.expose('visitedUrlsCommandCounts')
      expect(commandCounts, 'command counts').to.deep.eq([
        { url: '/public/index.html', count: 1 },
      ])
    })

    // make sure the index page is tested for longer period
    // so the sorted order is always: index, about

    cy.wait(100)
    cy.contains('a', 'About').click()
    cy.location('pathname').should('eq', '/public/about.html')
    cy.go('back')
    cy.location('pathname')
      .should('eq', '/public/index.html')
      .log('**check command counts**')
      .then(() => {
        const commandCounts = Cypress.expose(
          'visitedUrlsCommandCounts',
        )
        expect(commandCounts, '3 pages with commands').to.have.length(
          3,
        )
        // TODO: verify the command names for clarity
        expect(commandCounts, 'command counts').to.deep.eq([
          { url: '/public/index.html', count: 4 },
          { url: '/public/about.html', count: 3 },
          { url: '/public/index.html', count: 2 },
        ])
      })
  })
})

after(() => {
  // check the saved counts, this hook runs after
  // the plugin saves the JSON file
  cy.readFile('cypress-visited-urls.json')
    .its('cypress/e2e/command-counts.cy.js')
    .its('Command counts / counts commands per page')
    .its('urls')
    .should('be.an', 'array')
    // we visited two pages
    // first we visited the index page, then the about page
    .and('have.length', 2)
    .then(([indexPage, aboutPage]) => {
      cy.wrap(indexPage, { log: false }).should(
        spok({
          $topic: 'index page',
          url: '/public/index.html',
          duration: (n) => n > 50 && n < 200,
          commandsCount: 7,
        }),
      )

      cy.wrap(aboutPage, { log: false }).should(
        spok({
          $topic: 'about page',
          url: '/public/about.html',
          duration: (n) => n > 10 && n < 100,
          commandsCount: 3,
        }),
      )
    })
})
