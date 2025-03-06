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

  interface FindSpecsOptions {
    urls: Record<string, object>
    filename: string
    url: string
    /**
     * Default: "commands"
     */
    metric: 'duration' | 'commands'
  }

  interface SpecWithTotal {
    spec: string
    total: number
  }
}
