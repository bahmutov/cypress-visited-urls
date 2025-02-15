# cypress-visited-urls

> A plugin to collect all visited urls across all specs

## Install

Add this plugin as a dev dependency

```
# using NPM
$ npm i -D cypress-visited-urls
# using Yarn
$ yarn add -D cypress-visited-urls
```

### Include in the E2E support file

```js
// cypress/support/e2e.js

import 'cypress-visited-urls'
```

**Note:** since the component specs do not visit meaningful URLs, we only configure this plugin in the E2E tests.

### Include in the plugins file

```js
// cypress.config.mjs

// https://github.com/bahmutov/cypress-visited-urls
import visitedUrlsPlugin from 'cypress-visited-urls/src/plugin'
export default defineConfig({
  e2e: {
    env: {
      visitedUrls: {
        // collect each URL the test runner visits
        // https://glebbahmutov.com/blog/collect-tested-urls/
        collect: true,
        urlsFilename: 'cypress-visited-urls.json',
      },
    }
    setupNodeEvents(cypressOn, config) {
      visitedUrlsPlugin(on, config)
      // IMPORTANT to return the config object
      // with the any changed environment variables
      return config
    }
  },
})
```

## Features

### filterUrl

Often the visited URLs have dynamic or random parts to them. To "normalize" the URLs before saving them you can pass your own `filterUrl` function to the plugin via config function.

```js
// cypress/support/e2e.js

// do not simply import the plugin
// import 'cypress-visited-urls'

// instead import configuration method
import { configureVisitedUrls } from 'cypress-visited-urls'

configureVisitedUrls({
  filterUrl(url) {
    // remove all query parameters
    return url.split('?')[0]
  },
})
```

The returned URL will be stored in the JSON file. If you return a falsy value, the URL won't be added.

## Find specs

You can find all specs with tests that visit a particular URL using partial string match

```
$ npx find-specs-by-url -f cypress-visited-urls.json -u index.html
# prints the list of comma-separated specs filenames
```

For example, run `npm run demo-find` command in this repo.

You can feed this list to Cypress

```
$ npx cypress run --spec $(npx find-specs-by-url -f cypress-visited-urls.json -u about.html)
# runs a single spec in this repo
```
