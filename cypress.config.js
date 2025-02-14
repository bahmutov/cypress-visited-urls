const { defineConfig } = require('cypress')

module.exports = defineConfig({
  defaultBrowser: 'electron',
  e2e: {
    // baseUrl, etc
    env: {
      visitedUrls: {
        // collect each URL the test runner visits
        // https://glebbahmutov.com/blog/collect-tested-urls/
        collect: true,
        urlsFilename: 'cypress-visited-urls.json',
      },
    },

    setupNodeEvents(on, config) {
      // implement node event listeners here
      // and load any plugins that require the Node environment
      require('./src/plugin')(on, config)
      // return the config object
      return config
    },
  },
})
