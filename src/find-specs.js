// @ts-check

const debug = require('debug')('cypress-visited-urls')

function findSpecsByUrl(options) {
  if (!options) {
    throw new Error('Missing options')
  }
  const { urls, url } = options

  const specs = []
  for (const spec of Object.keys(urls)) {
    const tests = Object.keys(urls[spec])
    for (const test of tests) {
      const testUrls = urls[spec][test]
      for (const pageInformation of testUrls) {
        const testUrl = pageInformation.url
        if (testUrl.includes(url)) {
          const record = {
            spec,
            test,
            url: testUrl,
            duration: pageInformation.duration || 0,
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
    const { spec: specName, duration } = spec
    if (totals[specName]) {
      totals[specName] += duration
    } else {
      totals[specName] = duration
    }
  })
  debug(totals)
  // console.table(totals)

  // transform the list of spec / durations into an array
  const specsWithTotalDuration = Object.keys(totals)
    .map((spec) => ({
      spec,
      totalDuration: totals[spec],
    }))
    .sort((a, b) => b.totalDuration - a.totalDuration)
  debug(specsWithTotalDuration)
  // console.table(specsWithTotalDuration)

  // print just the spec names
  // const uniqueSpecs = [...new Set(specs.map((o) => o.spec))]
  const uniqueSpecs = specsWithTotalDuration.map((o) => o.spec)
  debug(uniqueSpecs)

  return uniqueSpecs
}

module.exports = { findSpecsByUrl }
