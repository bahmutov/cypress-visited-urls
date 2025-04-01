/// <reference path="./index.d.ts" />
// @ts-check

const debug = require('debug')('cypress-visited-urls')

/**
 * @param {import('./index').FindSpecsOptions} options
 * @returns {import('./index').SpecWithTotal[]}
 */
function findSpecsByUrlAndMeasure(options) {
  if (!options) {
    throw new Error('Missing options')
  }
  const { urls, url } = options
  const metric = options.metric || 'commands'
  const cutoff = options.cutoff || 0

  /** @type {Record<string, Record<string, { urls: { url: string, duration: number, commandsCount: number }[] }>>} */
  const typedUrls =
    /** @type {Record<string, Record<string, { urls: { url: string, duration: number, commandsCount: number }[] }>>} */ (
      urls
    )

  const specs = []
  for (const spec of Object.keys(typedUrls)) {
    const tests = Object.keys(typedUrls[spec])
    for (const test of tests) {
      const testUrls = typedUrls[spec][test]?.urls || []
      for (const pageInformation of testUrls) {
        const testUrl = pageInformation.url
        if (testUrl.includes(url)) {
          const measure =
            (metric === 'duration'
              ? pageInformation.duration
              : pageInformation.commandsCount) || 0

          const record = {
            spec,
            test,
            url: testUrl,
            measure,
          }
          specs.push(record)
        }
      }
    }
  }
  debug(specs)
  // console.table(specs)

  // compute the total for the given page per spec
  /** @type {Record<string, number>} */
  const totals = {}
  specs.forEach((spec) => {
    const { spec: specName, measure } = spec
    if (totals[specName]) {
      totals[specName] += measure
    } else {
      totals[specName] = measure
    }
  })
  // debug(totals)
  // console.table(totals)

  // transform the list of spec / measurements into an array
  const specsWithMeasurements = Object.keys(totals)
    .map((spec) => ({
      spec,
      total: totals[spec],
    }))
    // sort all specs by the measured value
    .sort((a, b) => b.total - a.total)
    // filter out specs that have total less than cutoff
    .filter((o) => o.total >= cutoff)
    // keep only the first N specs
    // Note: if "n" is undefined, keeps all specs
    .slice(0, options.n)
  debug(specsWithMeasurements)

  return specsWithMeasurements
}

/**
 * @param {import('./index').FindSpecsOptions} options
 * @returns {string[]}
 */
function findSpecsByUrl(options) {
  const specsWithMeasurements = findSpecsByUrlAndMeasure(options)
  // console.table(specsWithTotalDuration)

  // print just the spec names
  const uniqueSpecs = specsWithMeasurements.map((o) => o.spec)
  debug(uniqueSpecs)

  return uniqueSpecs
}

module.exports = { findSpecsByUrlAndMeasure, findSpecsByUrl }
