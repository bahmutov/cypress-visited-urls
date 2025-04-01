export type VisitedPage = {
  url: string
  /**
   * How long Cypress spend on the page (ms)
   */
  duration: number
  /**
   * The count of Cypress commands executed on that page
   */
  commandsCount: number
}

export type VisitedTestEvent = {
  label: string
  data: string | number | boolean | Record<string, any>
}

export type FindSpecsOptions = {
  urls: Record<string, object>
  /**
   * URL or part of URL to match
   */
  url: string
  /**
   * Default: "commands"
   */
  metric?: 'duration' | 'commands'
  /**
   * When using a metric, this is the smallest value to consider.
   * All specs under the cutoff are filtered out.
   */
  cutoff?: number
  /**
   * How many top specs to return. Default: all of them
   */
  n?: number
}

export type SpecWithTotal = {
  spec: string
  total: number
}

declare global {
  namespace Cypress {
    interface Cypress {
      /**
       * Add an event to the test record set for the current test.
       * @param event An event to save.
       * @see https://github.com/bahmutov/cypress-visited-urls
       * @example
       *   Cypress.addVisitedTestEvent({
       *     label: 'API call',
       *     data: {
       *       url: '/users',
       *       method: 'GET',
       *       statusCode: 200,
       *     },
       *   })
       */
      addVisitedTestEvent(event: VisitedTestEvent): void
    }
  }
}
