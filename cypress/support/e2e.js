import { configureVisitedUrls } from '../../src/support'

configureVisitedUrls({
  filterUrl(url) {
    // remove all query parameters
    return url.split('?')[0]
  },
})
