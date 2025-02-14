// @ts-check

function shouldCollectUrls() {
  const pluginConfig = Cypress.env('visitedUrls')
  return Boolean(pluginConfig?.collect)
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
})
