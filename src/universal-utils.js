// these utilities can execute in Node and in browser
/**
 * @param {Record<string, any>} obj
 * @returns {Record<string, any>}
 */
function sortKeys(obj) {
  /** @type {Record<string, any>} */
  const result = {}
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      result[key] = obj[key]
    })

  return result
}

module.exports = { sortKeys }
