#!/usr/bin/env node

// @ts-check
const arg = require('arg')
const path = require('path')
const debug = require('debug')('cypress-visited-urls')
const core = require('@actions/core')
const humanizeDuration = require('humanize-duration')
const { findSpecsByUrlAndMeasure } = require('../src/find-specs')

/**
 * @param {string} value
 * @returns {'duration' | 'commands'}
 */
function checkMetric(value) {
  const allowedMetrics = ['duration', 'commands']
  if (!allowedMetrics.includes(value)) {
    throw new Error(
      `Invalid value for --metric: ${value}. Allowed values are: ${allowedMetrics.join(', ')}`,
    )
  }
  // @ts-ignore
  return value
}

const args = arg({
  '--filename': String,
  '--url': String,
  '--metric': checkMetric,
  '--set-gha-outputs': Boolean,
  // print the found specs with the metric as a table
  '--table': Boolean,
  // filter out specs with the metric below this value
  '--cutoff': Number,
  '-f': '--filename',
  '-u': '--url',
  '-m': '--metric',
  '-t': '--table',
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

const metric = checkMetric(args['--metric'] || 'commands')

const cutoff = Number(args['--cutoff'])
if (cutoff < 1) {
  throw new Error('--cutoff should be a positive number')
}

const specsWithMeasurements = findSpecsByUrlAndMeasure({
  urls,
  filename,
  url,
  metric,
  cutoff,
})
const uniqueSpecs = specsWithMeasurements.map((o) => o.spec)

if (args['--table']) {
  console.log(
    '=== Specs testing page "%s" sorted by %s %s===',
    url,
    metric,
    cutoff > 0 ? `with cutoff ${cutoff} ` : '',
  )
  if (metric === 'duration') {
    const formatted = specsWithMeasurements.map((o) => {
      return {
        spec: o.spec,
        duration: humanizeDuration(o.total, {
          maxDecimalPoints: 2,
        }),
      }
    })
    console.table(formatted)
  } else {
    const formatted = specsWithMeasurements.map((o) => {
      return {
        spec: o.spec,
        commands: o.total,
      }
    })
    console.table(formatted)
  }
} else {
  console.log(uniqueSpecs.join(','))
}

if (args['--set-gha-outputs']) {
  debug(
    'setting GitHub Actions outputs visitedSpecsN and visitedSpecs',
  )
  debug('visitedSpecsN %d', uniqueSpecs.length)
  core.setOutput('visitedSpecsN', uniqueSpecs.length)
  core.setOutput('visitedSpecs', uniqueSpecs.join(','))
}
