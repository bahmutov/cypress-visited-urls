namespace VisitedUrls {
  /**
   * Information about a single page visited during the test.
   * Important: this is cumulative information. Even if we visit
   * the same page multiple times, we count the total time spent.
   */
  interface VisitedPage {
    url: string
    duration: number
  }
}
