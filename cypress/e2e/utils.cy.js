/// <reference types="cypress" />
// @ts-check

chai.config.truncateThreshold = 1000
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
      testEvents: [],
      durationChangeThreshold: 0,
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
      // the spec exists, but the test does not
      specName: 'zoo',
      testName: 'b1',
      testUrls: [],
      durationChangeThreshold: 0,
      testEvents: [],
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
        b1: { urls: [], testEvents: [] },
        'my test title': [],
      },
    })
  })

  it('updates the test pages if duration is above the threshold', () => {
    const allVisitedUrls = {
      zoo: {
        'my test title': [
          {
            url: '/index.html',
            duration: 50,
          },
        ],
      },
      foo: {
        'my other test title': [],
      },
    }

    const { updated, allUrls } = updateVisitedUrls({
      allVisitedUrls,
      specName: 'zoo',
      testName: 'my test title',
      testUrls: [
        {
          url: '/index.html',
          duration: 70,
          commandsCount: 10,
        },
      ],
      durationChangeThreshold: 10,
      testEvents: [],
    })

    expect(updated, 'updated').to.be.true
    expect(allUrls, 'all urls').to.deep.equal({
      foo: {
        'my other test title': [],
      },
      zoo: {
        'my test title': {
          urls: [
            {
              url: '/index.html',
              duration: 70,
              commandsCount: 10,
            },
          ],
          testEvents: [],
        },
      },
    })
  })

  it('does nothing if duration is below the threshold', () => {
    const allVisitedUrls = {
      zoo: {
        'my test title': {
          urls: [
            {
              url: '/index.html',
              duration: 50,
              commandsCount: 10,
            },
          ],
          testEvents: [],
        },
      },
      foo: {
        'my other test title': [],
      },
    }

    const { updated, allUrls } = updateVisitedUrls({
      allVisitedUrls,
      specName: 'zoo',
      testName: 'my test title',
      testUrls: [
        {
          url: '/index.html',
          duration: 70,
          commandsCount: 10,
        },
      ],
      // threshold above any duration difference
      durationChangeThreshold: 30,
      testEvents: [],
    })

    expect(updated, 'updated').to.be.false
    expect(allUrls, 'all urls').to.deep.equal(allVisitedUrls)
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
