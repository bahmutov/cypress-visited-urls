import 'cypress-map'
import { configureVisitedUrls } from '../../src/support'

configureVisitedUrls({
  filterUrl(url) {
    // remove all query parameters
    return url.split('?')[0]
  },
  // filtering all collected URLs before saving to the JSON file
  preSaveFilterUrls(visitedUrls, previousUrls, specName, testName) {
    if (!Array.isArray(visitedUrls)) {
      throw new Error('Expected urls to be a list')
    }
    if (!Array.isArray(previousUrls)) {
      throw new Error('Expected previous urls to be a list')
    }
    if (typeof specName !== 'string') {
      throw new Error('Expected specName to be a string')
    }
    if (typeof testName !== 'string') {
      throw new Error('Expected testName to be a string')
    }

    // a custom logic to filter out URLs after the test has run
    if (
      specName === 'cypress/e2e/filter-before-save.cy.js' &&
      testName ===
        'Filter before save / filters URLs for this test before saving'
    ) {
      return visitedUrls.map(({ url, duration }) => {
        expect(duration, 'duration is a number').to.be.a('number')
        return { url: 'prefilter-save: ' + url, duration }
      })
    }

    return visitedUrls
  },
})
