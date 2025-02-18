/// <reference types="cypress" />
// @ts-check

import { updateVisitedUrls } from '../../src/utils'

describe('updateVisitedUrls', () => {
  it('sorts the spec names', () => {
    const allVisitedUrls = {
      zoo: {
        'my test title': [],
      },
      foo: {
        'my other test title': [],
      },
    }

    const { updated, allUrls } = updateVisitedUrls({
      allVisitedUrls,
      specName: 'moo',
      testName: 'my new test title',
      testUrls: [],
    })

    expect(updated, 'updated').to.be.true

    const specNames = Object.keys(allUrls)
    expect(
      specNames,
      'moo should be between foo and zoo',
    ).to.deep.equal(['foo', 'moo', 'zoo'])
  })

  it('sorts the test titles for each spec', () => {
    const allVisitedUrls = {
      zoo: {
        'my test title': [],
        aaa1: [],
      },
      foo: {
        'my other test title': [],
      },
    }

    const { updated, allUrls } = updateVisitedUrls({
      allVisitedUrls,
      specName: 'zoo',
      testName: 'b1',
      testUrls: [],
    })

    expect(updated, 'updated').to.be.true

    expect(
      allUrls,
      'spec names and titles sorted alphabetically',
    ).to.deep.equal({
      foo: {
        'my other test title': [],
      },
      zoo: {
        aaa1: [],
        b1: [],
        'my test title': [],
      },
    })
  })
})

describe('Merging objects', () => {
  it('merges right to left', () => {
    const merged = {
      letter: 'a',
    }
    Object.assign(merged, { letter: 'b' }, { letter: 'c' })
    expect(merged, 'merged object').to.deep.equal({ letter: 'c' })
  })
})
