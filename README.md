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
