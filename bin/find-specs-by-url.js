#!/usr/bin/env node

const arg = require('arg')
const debug = require('debug')('cypress-visited-urls')
const core = require('@actions/core')
const { findSpecsByUrl } = require('../src/find-specs')

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

const uniqueSpecs = findSpecsByUrl({
  filename: args['--filename'],
  url: args['--url'],
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
