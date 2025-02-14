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
})
