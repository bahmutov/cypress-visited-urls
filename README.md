# cypress-visited-urls

> A plugin to collect all visited urls across all specs

## Learn more

- 📝 blog post [Collect All URLs Visited During Cypress Test](https://glebbahmutov.com/blog/collect-tested-urls/)
- 📝 blog post [Run Cypress Tests For The Given URL](https://glebbahmutov.com/blog/run-cypress-tests-for-the-given-url/)
- 🎓 online course [Testing The Swag Store](https://cypress.tips/courses/swag-store)
- 🎁 example project [bahmutov/cypress-visited-urls-example](https://github.com/bahmutov/cypress-visited-urls-example)

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

// https://glebbahmutov.com/blog/collect-tested-urls/
import { configureVisitedUrls } from 'cypress-visited-urls'

configureVisitedUrls()
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

// https://glebbahmutov.com/blog/collect-tested-urls/
import { configureVisitedUrls } from 'cypress-visited-urls'

configureVisitedUrls({
  filterUrl(url) {
    // remove all query parameters
    return url.split('?')[0]
  },
})
```

The returned URL will be stored in the JSON file. If you return a falsy value, the URL won't be added.

### preSaveFilterUrls

Once the test finishes and the plugin prepares to save the updated visited URLs file, you can prefilter / modify all URLs for the current test.

```js
// cypress/support/e2e.js

// https://glebbahmutov.com/blog/collect-tested-urls/
import { configureVisitedUrls } from 'cypress-visited-urls'

configureVisitedUrls({
  // currentUrls and previousUrls are two arrays
  // with the current test run and the previously saved URLs for this test
  // currentUrls: string[]
  // previousUrls: string[]
  // specName: string relative spec name
  // testName: string full test title
  preSaveFilterUrls(currentUrls, previousUrls, specName, testName) {
    // remove all urls that point at the /?callback_ for example
    // and are not in the previously saved list
    return currentUrls.filter(
      (s) => s.startsWith('/?callback_') && previousUrls.includes(s),
    )
  },
})
```

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

### set GitHub Actions outputs

Add flag `--set-gha-outputs` to save the list of found specs and their number in the outputs `visitedSpecs` and `visitedSpecsN`

## Merge visited URLs JSON files

If you have multiple JSON files with visited URLs, you can merge them into a single JSON file

```
$ npx merge-visited-urls --files 'folder/*.json' --output 'visited-urls.json'
```

**Tip:** visited urls are updated only when the test is successful. To avoid "losing" visited URL information if a test fails, you can merge the existing JSON urls file together with new updates by passing it first

```
$ npx merge-visited-urls --files 'visited-urls.json,folder/*.json' --output 'visited-urls.json'
```

## Small print

Author: Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt; &copy; 2025

- [@bahmutov](https://twitter.com/bahmutov)
- [glebbahmutov.com](https://glebbahmutov.com)
- [blog](https://glebbahmutov.com/blog)
- [videos](https://www.youtube.com/glebbahmutov)
- [presentations](https://slides.com/bahmutov)
- [cypress.tips](https://cypress.tips)
- [Cypress Tips & Tricks Newsletter](https://cypresstips.substack.com/)
- [my Cypress courses](https://cypress.tips/courses)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/cypress-visited-urls/issues) on Github
