#!/usr/bin/env node

// @ts-check
const arg = require('arg')
const path = require('path')
const debug = require('debug')('cypress-visited-urls')
const core = require('@actions/core')
const { findSpecsByUrl } = require('../src/find-specs')

const args = arg({
  '--filename': String,
  '--url': String,
  '--metric': (value) => {
    const allowedMetrics = ['duration', 'commands']
    if (!allowedMetrics.includes(value)) {
      throw new Error(
        `Invalid value for --metric: ${value}. Allowed values are: ${allowedMetrics.join(', ')}`,
      )
    }
    return value
  },
  '--set-gha-outputs': Boolean,
  '-f': '--filename',
  '-u': '--url',
  '-m': '--metric',
})
debug('parsed arguments', args)

if (!args['--filename']) {
  throw new Error('Missing --filename argument')
}

if (!args['--url']) {
  throw new Error('Missing --url argument')
}

const url = args['--url']
if (url.includes(',')) {
  const message = [
    'URL should not contain commas',
    'Finding specs covering multiple URLs is not supported yet',
    'see https://github.com/bahmutov/cypress-visited-urls/issues/30',
  ].join('\n')
  throw new Error(message)
}

const filename = args['--filename']
const urls = require(path.resolve(filename))
debug('loaded URLs from file', filename)

const uniqueSpecs = findSpecsByUrl({
  urls,
  filename,
  url,
})
console.log(uniqueSpecs.join(','))

if (args['--set-gha-outputs']) {
  debug(
    'setting GitHub Actions outputs visitedSpecsN and visitedSpecs',
  )
  debug('visitedSpecsN %d', uniqueSpecs.length)
  core.setOutput('visitedSpecsN', uniqueSpecs.length)
  core.setOutput('visitedSpecs', uniqueSpecs.join(','))
}
