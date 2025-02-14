// @ts-check

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
      Cypress.env('visitedUrlsSet').add(url)
    })
  }
})

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
  const urls = set.values().toArray()
  const text = `visited ${urls.length} URL(s): ${urls.join(', ')}`
  cy.log(`This test ${text}`)
  cy.task(
    'visited-urls-plugin:terminal',
    `${specName} test "${testName}" ${text}`,
    { log: false },
  )

  const filename = getVisitedUrlsFilename()
  if (filename) {
    cy.readFile(filename, { log: false })
      // file might not exist, we will create it then
      .should(Cypress._.noop)
      .then((visitedUrls) => {
        if (!visitedUrls) {
          visitedUrls = {}
        }
        const copy = Cypress._.cloneDeep(visitedUrls)

        // update the object with the new urls
        // this is will be an object
        // spec relative path  is the key
        // value is another object
        // where the key is the test title (with "/" separators)
        // and the value is the list of urls visited during this test
        const specTests = visitedUrls[specName] || {}
        specTests[testName] = urls
        visitedUrls[specName] = specTests

        if (!Cypress._.isEqual(copy, visitedUrls)) {
          cy.log('**saving updated visited urls**')
          cy.writeFile(filename, visitedUrls)
        } else {
          cy.log('no changes to visited urls')
        }
      })
  }
})
