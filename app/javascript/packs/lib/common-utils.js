export function flattenArrayOfObjects(data, key) {
  return data.reduce((a, row) => {
    const arr = row[key];
    delete row[key];
    return [...a, ...(arr || [{}]).map(s => ({...s, ...row}))]
  }, [])
}

// exports.flattenArrayOfObjects = flattenArrayOfObjects