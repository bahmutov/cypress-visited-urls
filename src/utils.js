// @ts-check

/**
 * @typedef {object} UpdateParams
 * @property {Record<string, object>} allVisitedUrls
 * @property {string} specName
 * @property {string} testName
 * @property {string[]} testUrls
 */
/**
 * Combines the existing record with all urls visited by all specs
 * with the information for a single test. The original reference object `allVisitedUrls`
 * is updated with the new information.
 * @param {UpdateParams} parameters
 * @returns {boolean} true if the object was updated
 */
function updateVisitedUrls({
  allVisitedUrls,
  specName,
  testName,
  testUrls,
}) {
  const copy = Cypress._.cloneDeep(allVisitedUrls)

  // update the object with the new urls
  // this is will be an object
  // spec relative path  is the key
  // value is another object
  // where the key is the test title (with "/" separators)
  // and the value is the list of urls visited during this test
  const specTests = allVisitedUrls[specName] || {}
  specTests[testName] = testUrls
  allVisitedUrls[specName] = specTests

  const updatedUrls = !Cypress._.isEqual(copy, allVisitedUrls)
  return updatedUrls
}

module.exports = { updateVisitedUrls }
