#!/usr/bin/env node

const path = require('path')
const arg = require('arg')
const debug = require('debug')('cypress-visited-urls')

const args = arg({
  '--filename': String,
  '--url': String,
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
    for (const testUrl of testUrls) {
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
