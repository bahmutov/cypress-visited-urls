// @ts-check
/// <reference types="cypress" />

const { updateVisitedUrls } = require('./utils')

//
// utilities
//
let filterUrl = Cypress._.identity
/**
 * Optional filter for all urls collected in the test.
 * Receives the list of URLs collect for the test during the current run
 * plus the list of URLs collected for the same test in the previous runs.
 * This function is called after the test has finished but before saving
 * the new list of URLs to the JSON file.
 * @param {string[]} urlsInThisTest
 * @param {string[]} previousUrlsInThisTest
 * @param {string} specName
 * @param {string} testName
 * @returns {string[]}
 */
let preSaveFilterUrls = (
  urlsInThisTest,
  previousUrlsInThisTest,
  specName,
  testName,
) => urlsInThisTest

function shouldCollectUrls() {
  const pluginConfig = Cypress.env('visitedUrls')
  return Boolean(pluginConfig?.collect)
}

function getVisitedUrlsFilename() {
  const pluginConfig = Cypress.env('visitedUrls')
  return pluginConfig?.urlsFilename
}

beforeEach(() => {
  const collectUrls = shouldCollectUrls()
  if (collectUrls) {
    Cypress.env('visitedUrlsSet', new Set())
    Cypress.on('url:changed', (url) => {
      // remove the base url
      const baseUrl =
        Cypress.config('baseUrl') || Cypress.config('proxyUrl') || ''
      url = url.replace(baseUrl, '')
      if (url) {
        const filteredUrl = filterUrl(url)
        if (filteredUrl) {
          Cypress.env('visitedUrlsSet').add(filteredUrl)
        }
      }
    })
  }
})

function printTextToTerminal(text) {
  cy.task('visited-urls-plugin:terminal', text, { log: false })
}
//
// hooks
//
afterEach(function saveVisitedUrls() {
  const collectUrls = shouldCollectUrls()
  if (!collectUrls) {
    return
  }

  const state = this.currentTest?.state
  if (state !== 'passed') {
    return
  }

  const specName = Cypress.spec.relative
  const testName = Cypress.currentTest.titlePath.join(' / ')

  const set = Cypress.env('visitedUrlsSet')
  // be defensive about values
  if (!set) {
    return
  }
  if (!(set instanceof Set)) {
    return
  }

  const values = set.values()
  if (!values) {
    return
  }
  const urls = [...values]
  const text = `visited ${urls.length} URL(s): ${urls.join(', ')}`
  cy.log(`This test ${text}`)
  printTextToTerminal(`${specName} test "${testName}" ${text}`)

  const filename = getVisitedUrlsFilename()
  if (filename) {
    cy.readFile(filename, { log: false })
      // file might not exist, we will create it then
      .should(Cypress._.noop)
      .then((visitedUrls) => {
        if (!visitedUrls) {
          visitedUrls = {}
        }

        let filteredTestUrls = urls
        // the current test urls for this test
        const currentTestUrls = visitedUrls[specName]?.[testName]
        if (
          Array.isArray(currentTestUrls) &&
          currentTestUrls.length
        ) {
          // we have already saved the urls for this test before
          // let the user look at these list and the list of new urls
          filteredTestUrls = preSaveFilterUrls(
            filteredTestUrls,
            currentTestUrls,
            specName,
            testName,
          )
          if (!filteredTestUrls) {
            filteredTestUrls = urls
          }
        }

        const { updated, allUrls } = updateVisitedUrls({
          allVisitedUrls: visitedUrls,
          specName,
          testName,
          testUrls: filteredTestUrls,
        })

        if (updated) {
          cy.log('**saving updated visited urls**')
          cy.writeFile(filename, allUrls)
          printTextToTerminal(
            `wrote updated visited urls file ${filename}`,
          )
        } else {
          cy.log('no changes to visited urls')
        }
      })
  }
})

export function configureVisitedUrls(options = {}) {
  filterUrl = options.filterUrl || Cypress._.identity
  if ('preSaveFilterUrls' in options) {
    // @ts-ignore
    preSaveFilterUrls = options.preSaveFilterUrls
  }
}
