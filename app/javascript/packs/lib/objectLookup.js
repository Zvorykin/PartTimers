function objectLookup(obj, path) {
  let parts = path.split(".")
  if (parts.length === 1) {
    // console.log(typeof obj[parts[0]])
    return obj[parts[0]]
  }
  return objectLookup(obj[parts[0]], parts.slice(1).join("."))
}

module.exports = objectLookup