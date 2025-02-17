// these utilities can execute in Node and in browser
function sortKeys(obj) {
  const result = {}
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      result[key] = obj[key]
    })

  return result
}

module.exports = { sortKeys }
