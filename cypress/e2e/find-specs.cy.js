import { findSpecsByUrl } from '../../src/find-specs'

describe('findSpecsByUrl', () => {
  it('finds a single specs that visit the given URL', () => {
    const urls = {
      'spec 1': {
        'test 1': [{ url: '/foo' }],
        'test 2': [{ url: '/bar' }],
      },
      'spec 2': {
        'test 3': [{ url: '/about.html' }],
        'test 4': [{ url: '/index.html' }],
      },
    }
    const specs = findSpecsByUrl({ urls, url: '/index.html' })

    expect(specs).to.deep.equal(['spec 2'])
  })

  it('finds several specs', () => {
    const urls = {
      'spec 1': {
        'test 1': [{ url: '/index.html' }],
        'test 2': [{ url: '/about.html' }],
      },
      'spec 2': {
        'test 3': [{ url: '/about.html' }],
        'test 4': [{ url: '/index.html' }],
      },
    }
    const specs = findSpecsByUrl({ urls, url: '/about' })

    expect(specs).to.deep.equal(['spec 1', 'spec 2'])
  })
})
