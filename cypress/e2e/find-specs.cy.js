/// <reference types="cypress" />
// @ts-check

import {
  findSpecsByUrlAndMeasure,
  findSpecsByUrl,
} from '../../src/find-specs'

describe('findSpecsByUrl', () => {
  it('finds a single specs that visit the given URL', () => {
    const urls = {
      'spec 1': {
        'test 1': { urls: [{ url: '/foo' }] },
        'test 2': { urls: [{ url: '/bar' }] },
      },
      'spec 2': {
        'test 3': { urls: [{ url: '/about.html' }] },
        'test 4': { urls: [{ url: '/index.html' }] },
      },
    }

    const specsWithTotals = findSpecsByUrlAndMeasure({
      urls,
      url: '/index.html',
      metric: 'duration',
    })
    expect(specsWithTotals, 'sorted specs').to.deep.equal([
      { spec: 'spec 2', total: 0 },
    ])

    const specs = findSpecsByUrl({
      urls,
      url: '/index.html',
      metric: 'duration',
    })

    expect(specs, 'spec names').to.deep.equal(['spec 2'])
  })

  it('finds several specs', () => {
    const urls = {
      'spec 1': {
        'test 1': { urls: [{ url: '/index.html' }] },
        'test 2': { urls: [{ url: '/about.html' }] },
      },
      'spec 2': {
        'test 3': { urls: [{ url: '/about.html' }] },
        'test 4': { urls: [{ url: '/index.html' }] },
      },
    }
    const specs = findSpecsByUrl({
      urls,
      url: '/about',
      metric: 'duration',
    })

    expect(specs).to.deep.equal(['spec 1', 'spec 2'])
  })

  it('returns the specs sorted by the total duration across all tests', () => {
    const urls = {
      'spec 1': {
        'test 1': { urls: [{ url: '/index.html' }] },
        'test 2': { urls: [{ url: '/about.html', duration: 100 }] },
      },
      'spec 2': {
        'test 3': { urls: [{ url: '/about.html', duration: 5_000 }] },
        'test 4': { urls: [{ url: '/index.html' }] },
        'test 5': { urls: [{ url: '/about.html', duration: 700 }] },
      },
    }

    const specsWithTotals = findSpecsByUrlAndMeasure({
      urls,
      url: '/about',
      metric: 'duration',
    })
    expect(specsWithTotals, 'sorted specs').to.deep.equal([
      { spec: 'spec 2', total: 5700 },
      { spec: 'spec 1', total: 100 },
    ])

    const specs = findSpecsByUrl({
      urls,
      url: '/about',
      metric: 'duration',
    })

    // the spec that spends the longest time on the page should be first
    expect(specs, 'filenames').to.deep.equal(['spec 2', 'spec 1'])
  })

  it('returns the specs sorted by the total counts across all tests', () => {
    const urls = {
      'spec 1': {
        'test 1': {
          urls: [{ url: '/index.html', commandsCount: 1 }],
        },
        'test 2': {
          urls: [
            { url: '/about.html', duration: 100, commandsCount: 2 },
          ],
        },
      },
      'spec 2': {
        'test 3': {
          urls: [
            { url: '/about.html', commandsCount: 1, duration: 5_000 },
          ],
        },
        'test 4': {
          urls: [{ url: '/index.html', commandsCount: 10 }],
        },
        'test 5': {
          urls: [
            { url: '/about.html', commandsCount: 3, duration: 700 },
          ],
        },
      },
      'spec 3': {
        'test 3': {
          urls: [
            { url: '/about.html', commandsCount: 1, duration: 5_000 },
          ],
        },
        'test 4': {
          urls: [{ url: '/index.html', commandsCount: 10 }],
        },
        'test 5': {
          urls: [
            { url: '/about.html', commandsCount: 20, duration: 700 },
          ],
        },
      },
    }

    const specsWithTotals = findSpecsByUrlAndMeasure({
      urls,
      url: '/about',
      metric: 'commands',
    })
    expect(specsWithTotals, 'sorted specs').to.deep.equal([
      { spec: 'spec 3', total: 21 },
      { spec: 'spec 2', total: 4 },
      { spec: 'spec 1', total: 2 },
    ])

    const specs = findSpecsByUrl({
      urls,
      url: '/about',
      metric: 'commands',
    })

    // the spec that spends the longest time on the page should be first
    expect(specs, 'filenames').to.deep.equal([
      'spec 3',
      'spec 2',
      'spec 1',
    ])
  })

  it('filters specs by commands cutoff', () => {
    const urls = {
      'spec 1': {
        'test 1': {
          urls: [{ url: '/index.html', commandsCount: 1 }],
        },
        'test 2': {
          urls: [
            { url: '/about.html', duration: 100, commandsCount: 2 },
          ],
        },
      },
      'spec 2': {
        'test 3': {
          urls: [
            { url: '/about.html', commandsCount: 1, duration: 5_000 },
          ],
        },
        'test 4': {
          urls: [{ url: '/index.html', commandsCount: 10 }],
        },
        'test 5': {
          urls: [
            { url: '/about.html', commandsCount: 3, duration: 700 },
          ],
        },
      },
      'spec 3': {
        'test 3': {
          urls: [
            { url: '/about.html', commandsCount: 1, duration: 5_000 },
          ],
        },
        'test 4': {
          urls: [{ url: '/index.html', commandsCount: 10 }],
        },
        'test 5': {
          urls: [
            { url: '/about.html', commandsCount: 20, duration: 700 },
          ],
        },
      },
    }

    const specsWithTotals = findSpecsByUrlAndMeasure({
      urls,
      url: '/about',
      metric: 'commands',
      cutoff: 4,
    })
    expect(specsWithTotals, 'sorted specs').to.deep.equal([
      { spec: 'spec 3', total: 21 },
      { spec: 'spec 2', total: 4 },
    ])
  })

  it('keeps the top N specs', () => {
    const urls = {
      'spec 1': {
        'test 1': {
          urls: [{ url: '/index.html', commandsCount: 1 }],
        },
        'test 2': {
          urls: [
            { url: '/about.html', duration: 100, commandsCount: 2 },
          ],
        },
      },
      'spec 2': {
        'test 3': {
          urls: [
            { url: '/about.html', commandsCount: 1, duration: 5_000 },
          ],
        },
        'test 4': {
          urls: [{ url: '/index.html', commandsCount: 10 }],
        },
        'test 5': {
          urls: [
            { url: '/about.html', commandsCount: 3, duration: 700 },
          ],
        },
      },
      'spec 3': {
        'test 3': {
          urls: [
            { url: '/about.html', commandsCount: 1, duration: 5_000 },
          ],
        },
        'test 4': {
          urls: [{ url: '/index.html', commandsCount: 10 }],
        },
        'test 5': {
          urls: [
            { url: '/about.html', commandsCount: 20, duration: 700 },
          ],
        },
      },
    }

    const specsWithTotals = findSpecsByUrlAndMeasure({
      urls,
      url: '/about',
      metric: 'commands',
      n: 1,
    })
    expect(specsWithTotals, 'sorted specs').to.deep.equal([
      { spec: 'spec 3', total: 21 },
    ])
  })

  it('works with N and cutoff', () => {
    const urls = {
      'spec 1': {
        'test 1': {
          urls: [{ url: '/index.html', commandsCount: 1 }],
        },
        'test 2': {
          urls: [
            { url: '/about.html', duration: 100, commandsCount: 2 },
          ],
        },
      },
      'spec 2': {
        'test 3': {
          urls: [
            { url: '/about.html', commandsCount: 1, duration: 5_000 },
          ],
        },
        'test 4': {
          urls: [{ url: '/index.html', commandsCount: 10 }],
        },
        'test 5': {
          urls: [
            { url: '/about.html', commandsCount: 3, duration: 700 },
          ],
        },
      },
      'spec 3': {
        'test 3': {
          urls: [
            { url: '/about.html', commandsCount: 1, duration: 5_000 },
          ],
        },
        'test 4': {
          urls: [{ url: '/index.html', commandsCount: 10 }],
        },
        'test 5': {
          urls: [
            { url: '/about.html', commandsCount: 20, duration: 700 },
          ],
        },
      },
    }

    const specsWithTotals = findSpecsByUrlAndMeasure({
      urls,
      url: '/about',
      metric: 'commands',
      cutoff: 4,
      // try to take more specs than found
      n: 10,
    })
    expect(specsWithTotals, 'sorted specs').to.deep.equal([
      { spec: 'spec 3', total: 21 },
      { spec: 'spec 2', total: 4 },
    ])
  })
})
