/// <reference path="./index.d.ts" />
// @ts-check

const debug = require('debug')('cypress-visited-urls')

/**
 * @param {VisitedUrls.FindSpecsOptions} options
 * @returns {VisitedUrls.SpecWithTotal[]}
 */
function findSpecsByUrlAndMeasure(options) {
  if (!options) {
    throw new Error('Missing options')
  }
  const { urls, url, metric } = options
  const cutoff = options.cutoff || 0

  const specs = []
  for (const spec of Object.keys(urls)) {
    const tests = Object.keys(urls[spec])
    for (const test of tests) {
      const testUrls = urls[spec][test]
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
  debug(specsWithMeasurements)

  return specsWithMeasurements
}

/**
 * @param {VisitedUrls.FindSpecsOptions} options
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
