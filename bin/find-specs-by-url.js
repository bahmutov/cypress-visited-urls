#!/usr/bin/env node

const path = require('path')
const arg = require('arg')
const debug = require('debug')('cypress-visited-urls')
const core = require('@actions/core')

const args = arg({
  '--filename': String,
  '--url': String,
  // when enabled, this code uses GitHub Actions Core package
  // to set two named outputs, one for number of changed specs
  // another for actual list of files
  '--set-gha-outputs': Boolean,
  // aliases
  '-f': '--filename',
  '-u': '--url',
})
debug('parsed arguments', args)

const urls = require(path.resolve(args['--filename']))
debug('loaded URLs from file', args['--filename'])

const specs = []
for (const spec of Object.keys(urls)) {
  const tests = Object.keys(urls[spec])
  for (const test of tests) {
    const testUrls = urls[spec][test]
    for (const pageInformation of testUrls) {
      const testUrl = pageInformation.url
      if (testUrl.includes(args['--url'])) {
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
console.log(uniqueSpecs.join(','))

if (args['--set-gha-outputs']) {
  debug(
    'setting GitHub Actions outputs visitedSpecsN and visitedSpecs',
  )
  debug('visitedSpecsN %d', uniqueSpecs.length)
  core.setOutput('visitedSpecsN', uniqueSpecs.length)
  core.setOutput('visitedSpecs', uniqueSpecs.join(','))
}
