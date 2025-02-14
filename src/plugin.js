function printTextToTerminal(text) {
  console.log(text)
  // Cypress tasks must return some value (including null)
  // to signal that there is no subject to yield
  return null
}

function registerVisitedUrlPlugin(on, config) {
  const { visitedUrls } = config.env

  if (!visitedUrls) {
    // nothing to register, this plugin isn't configured
    return
  }

  on('task', {
    'visited-urls-plugin:terminal': printTextToTerminal,
  })
}

module.exports = registerVisitedUrlPlugin
