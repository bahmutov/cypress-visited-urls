namespace VisitedUrls {
  /**
   * Information about a single page visited during the test.
   * Important: this is cumulative information. Even if we visit
   * the same page multiple times, we count the total time spent.
   */
  interface VisitedPage {
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

  interface VisitedTestEvent {
    label: string
    data: Record<string, any>
  }

  interface FindSpecsOptions {
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

  interface SpecWithTotal {
    spec: string
    total: number
  }
}
