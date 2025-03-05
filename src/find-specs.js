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
          specs.push({
            spec,
            test,
            url: testUrl,
          })
        }
      }
    }
  }
  debug(specs)

  // print just the spec names
  const uniqueSpecs = [...new Set(specs.map((o) => o.spec))]

  return uniqueSpecs
}

module.exports = { findSpecsByUrl }
