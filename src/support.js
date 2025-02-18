// @ts-check

const { updateVisitedUrls } = require('./utils')

//
// utilities
//
let filterUrl = Cypress._.identity

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
        const { updated, allUrls } = updateVisitedUrls({
          allVisitedUrls: visitedUrls,
          specName,
          testName,
          testUrls: urls,
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
}
