// @ts-check

const { sortKeys } = require('./universal-utils')

/**
 * @typedef {object} UpdateParams
 * @property {Record<string, object>} allVisitedUrls
 * @property {string} specName
 * @property {string} testName
 * @property {import('./index').VisitedPage[]} testUrls
 * @property {number} durationChangeThreshold Duration should change by at least this much to be considered different
 * @property {import('./index').VisitedTestEvent[]} testEvents
 */
/**
 * Combines the existing record with all urls visited by all specs
 * with the information for a single test. The original reference object `allVisitedUrls`
 * is updated with the new information.
 * @param {UpdateParams} parameters
 * @returns {{ updated: boolean, allUrls: Record<string, any>}} true if the object was updated
 */
function updateVisitedUrls({
  allVisitedUrls,
  specName,
  testName,
  testUrls,
  durationChangeThreshold,
  testEvents,
}) {
  const copy = Cypress._.cloneDeep(allVisitedUrls)

  // update the object with the new urls
  // this is will be an object
  // spec relative path  is the key
  // value is another object
  // where the key is the test title (with "/" separators)
  /** @type {Record<string, { urls: import('./index').VisitedPage[], testEvents: import('./index').VisitedTestEvent[] }>} */
  const specTests =
    /** @type {Record<string, { urls: import('./index').VisitedPage[], testEvents: import('./index').VisitedTestEvent[] }>} */ (
      allVisitedUrls[specName] || {}
    )
  if (testName in specTests) {
    const prevTestData = specTests[testName]

    const eventsAreSame = Cypress._.isEqual(
      prevTestData.testEvents,
      testEvents,
    )
    if (!eventsAreSame) {
      specTests[testName] = { urls: testUrls, testEvents }
    } else {
      // look at the URLs and durations
      const prevPagesForThisTest = prevTestData.urls || []
      const prevPageUrlsForThisTest = Cypress._.map(
        prevPagesForThisTest,
        'url',
      )
      const currPageUrlsForThisTest = Cypress._.map(testUrls, 'url')
      if (
        Cypress._.isEqual(
          prevPageUrlsForThisTest,
          currPageUrlsForThisTest,
        )
      ) {
        // look at the durations within the threshold
        const prevDurations = prevPagesForThisTest.map(
          (p) => p.duration || 0,
        )
        const currDurations = testUrls.map((p) => p.duration || 0)
        const hasDurationDifference = currDurations.some(
          (curr, i) =>
            Math.abs(curr - prevDurations[i]) >
            durationChangeThreshold,
        )
        if (hasDurationDifference) {
          specTests[testName] = { urls: testUrls, testEvents }
        } else {
          // console.log('no duration differences')
        }
      } else {
        specTests[testName] = { urls: testUrls, testEvents }
      }
    }
  } else {
    specTests[testName] = { urls: testUrls, testEvents }
  }

  // TODO: update the information if the commands counts change > N

  // sort the test titles
  allVisitedUrls[specName] = sortKeys(specTests)

  // sort the spec names in the url object for easy maintenance
  allVisitedUrls = /** @type {Record<string, object>} */ (
    sortKeys(allVisitedUrls)
  )

  const updated = !Cypress._.isEqual(copy, allVisitedUrls)
  return { updated, allUrls: allVisitedUrls }
}

module.exports = { updateVisitedUrls }
