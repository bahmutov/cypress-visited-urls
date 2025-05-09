/// <reference types="cypress" />
/// <reference path="./index.d.ts" />
/** @typedef {import('./index').VisitedPage} VisitedPage */

const { updateVisitedUrls } = require('./utils')

//
// utilities
//
let filterUrl = Cypress._.identity
/**
 * Optional filter for all urls collected in the test.
 * Receives the list of URLs collect for the test during the current run
 * plus the list of URLs collected for the same test in the previous runs.
 * This function is called after the test has finished but before saving
 * the new list of URLs to the JSON file.
 * @param {VisitedPage[]} urlsInThisTest
 * @param {string[]} previousUrlsInThisTest
 * @param {string} specName
 * @param {string} testName
 * @returns {VisitedPage[]}
 */
let preSaveFilterUrls = (
  urlsInThisTest,
  previousUrlsInThisTest,
  specName,
  testName,
) => urlsInThisTest

function shouldCollectUrls() {
  const pluginConfig = Cypress.env('visitedUrls')
  return Boolean(pluginConfig?.collect)
}

function getVisitedUrlsFilename() {
  const pluginConfig = Cypress.env('visitedUrls')
  return pluginConfig?.urlsFilename
}

function onCommandEnd() {
  const commandCounts = Cypress.env('visitedUrlsCommandCounts')
  if (commandCounts.length) {
    const theCurrentCount = commandCounts[commandCounts.length - 1]
    theCurrentCount.count += 1
  }
}

beforeEach(() => {
  const collectUrls = shouldCollectUrls()
  if (collectUrls) {
    // TODO: deprecate this set of just urls
    // in favor of visitedUrlsTimeStamps that has urls and durations
    Cypress.env('visitedUrlsSet', new Set())
    Cypress.env('visitedUrlsTimeStamps', [])
    Cypress.env('visitedUrlsCommandCounts', [])
    Cypress.env('visitedTestEvents', [])

    Cypress.addVisitedTestEvent = ({ label, data }) => {
      if (typeof label !== 'string' || !label) {
        throw new Error('label must be a non-empty string')
      }
      if (typeof data === 'undefined') {
        throw new Error('data must be defined')
      }

      // for now check if the event with the same label and data already exists
      const savedEvents = Cypress.env('visitedTestEvents')
      const existing = Cypress._.find(savedEvents, { label, data })
      if (existing) {
        existing.count += 1
        return
      }
      Cypress.env('visitedTestEvents').push({ label, data, count: 1 })
    }

    Cypress.on('url:changed', (url) => {
      // remove the base url
      const baseUrl =
        Cypress.config('baseUrl') || Cypress.config('proxyUrl') || ''
      url = url.replace(baseUrl, '')
      if (url) {
        const filteredUrl = filterUrl(url)
        if (filteredUrl) {
          Cypress.env('visitedUrlsSet').add(filteredUrl)
          const timestamps = Cypress.env('visitedUrlsTimeStamps')
          timestamps.push({
            url: filteredUrl,
            timestamp: +Date.now(),
          })

          const counts = Cypress.env('visitedUrlsCommandCounts')
          counts.push({
            url: filteredUrl,
            count: 0,
          })
        }
      }
    })

    cy.on('command:end', onCommandEnd)
  }
})

/**
 * @param {string} text
 */
function printTextToTerminal(text) {
  cy.task('visited-urls-plugin:terminal', text, { log: false })
}
//
// hooks
//
afterEach(function saveVisitedUrls() {
  const collectUrls = shouldCollectUrls()
  if (!collectUrls) {
    return
  }

  // stop recording the commands
  cy.removeListener('command:end', onCommandEnd)

  const state = this.currentTest?.state
  if (state !== 'passed') {
    return
  }

  const specName = Cypress.spec.relative
  const testName = Cypress.currentTest.titlePath.join(' / ')

  /** @type {Record<string, { url: string, count: number }>} */
  let pageCommandCounts = {}
  const commandCounts = Cypress.env('visitedUrlsCommandCounts')
  // console.table(commandCounts)
  if (Array.isArray(commandCounts) && commandCounts.length) {
    // calculate the sum of command counts for each URL
    commandCounts.forEach((cc) => {
      const { url, count } = cc
      const prev = pageCommandCounts[url]
      if (prev) {
        prev.count += count
        pageCommandCounts[url] = prev
      } else {
        pageCommandCounts[url] = { url, count }
      }
    })
  }

  /** @type {VisitedPage[]} */
  let urls = []

  const timestamps = Cypress.env('visitedUrlsTimeStamps')
  if (Array.isArray(timestamps) && timestamps.length) {
    const now = +Date.now()
    const durations = timestamps.map((ts, k) => {
      const { url, timestamp } = ts
      if (k === timestamps.length - 1) {
        return {
          url,
          timestamp,
          duration: now - timestamp,
        }
      } else {
        const next = timestamps[k + 1]
        return {
          url,
          timestamp,
          duration: next.timestamp - timestamp,
        }
      }
    })
    // console.table(durations)
    // compute the total duration spent on each page
    /** @type {Record<string, { url: string, duration: number, commandsCount: number }>} */
    const pageDurations = {}
    // debugger
    durations.forEach((d) => {
      const { url, duration } = d
      const prev = pageDurations[url]
      if (prev) {
        prev.duration += duration
        pageDurations[url] = prev
      } else {
        pageDurations[url] = { url, duration, commandsCount: 0 }
      }
    })
    urls = Object.values(pageDurations)
    urls.sort((a, b) => b.duration - a.duration)
    // console.table(urls)
  }

  if (urls && urls.length) {
    const pages = urls.map((url) => url.url)
    const text = `visited ${pages.length} URL(s): ${pages.join(', ')}`
    cy.log(`This test ${text}`)
    printTextToTerminal(`${specName} test "${testName}" ${text}`)
  }

  const testEvents = Cypress.env('visitedTestEvents')
  cy.log(`${testEvents.length} test events`)

  const filename = getVisitedUrlsFilename()
  if (filename) {
    cy.readFile(filename, { log: false })
      // file might not exist, we will create it then
      .should(Cypress._.noop)
      .then((visitedUrls) => {
        if (!visitedUrls) {
          visitedUrls = {}
        }

        let filteredTestUrls = urls
        // the current test urls for this test
        const currentTestUrls =
          visitedUrls[specName]?.[testName]?.urls
        if (
          Array.isArray(currentTestUrls) &&
          currentTestUrls.length
        ) {
          // we have already saved the urls for this test before
          // let the user look at these list and the list of new urls
          filteredTestUrls = preSaveFilterUrls(
            filteredTestUrls,
            currentTestUrls,
            specName,
            testName,
          )
          if (!filteredTestUrls) {
            filteredTestUrls = urls
          }
        }

        // add command counts to each test page
        filteredTestUrls.forEach((record) => {
          const { url } = record
          const counts = pageCommandCounts[url]
          record.commandsCount = counts?.count || 0
        })
        // console.table(filteredTestUrls)

        const { updated, allUrls } = updateVisitedUrls({
          allVisitedUrls: visitedUrls,
          specName,
          testName,
          testUrls: filteredTestUrls,
          durationChangeThreshold: 500,
          testEvents,
        })

        if (updated) {
          cy.log('**saving updated visited urls**')
          cy.writeFile(filename, allUrls)
          printTextToTerminal(
            `wrote updated visited urls file ${filename}`,
          )
        } else {
          cy.log('no changes to visited urls')
        }
      })
  }
})

/**
 * @typedef {Object} ConfigureVisitedUrlsOptions
 * @property {function(string): string} [filterUrl]
 * @property {function(VisitedPage[], string[], string, string): VisitedPage[]} [preSaveFilterUrls]
 */

/**
 * @param {ConfigureVisitedUrlsOptions} options
 */
export function configureVisitedUrls(options) {
  if (!options) {
    options = {}
  }

  // @ts-ignore
  filterUrl = options.filterUrl || Cypress._.identity
  if ('preSaveFilterUrls' in options) {
    // @ts-ignore
    preSaveFilterUrls = options.preSaveFilterUrls
  }
}
