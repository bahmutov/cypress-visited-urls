#!/usr/bin/env node

const arg = require('arg')
const debug = require('debug')('cypress-visited-urls')
const globby = require('globby')
const { sortKeys } = require('../src/universal-utils')
const fs = require('fs')

const args = arg({
  '--files': String,
  '--output': String,
})
debug('parsed arguments', args)

console.log('Loading files following pattern "%s"', args['--files'])
const allFiles = globby.sync(args['--files'], {
  absolute: true,
})
debug('found %d json files', allFiles.length)
debug(allFiles.join(','))

const merged = {}
Object.assign(merged, ...allFiles.map((f) => require(f)))

const sorted = sortKeys(merged)
fs.writeFileSync(args['--output'], JSON.stringify(sorted, null, 2))
console.log('Saved merged visited URLs file "%s"', args['--output'])
