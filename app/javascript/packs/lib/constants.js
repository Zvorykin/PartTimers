const CONSTANTS = {
  EMPTY_TABLE: {
    columns: [],
    data: []
  },
  SUCCESSFUL_RESPONSE: {
    result: 'success'
  },
  MESSAGES: {
    append: "Успешно добавлено!",
    changed: "Изменения приняты!",
    saved: 'Успешно сохранено!'
  },
  FORMATS: {
    shortDatetime: 'Y-MM-DD HH-mm-ss',
    shortDate: 'Y-MM-DD',
    shortLocalDate: 'dd.MM.yyyy',
    shortLocalDatetime: 'dd.MM.yyyy HH:mm:ss',
  }
}

module.exports = CONSTANTS

// function getConst(path) {
//   // let request = CONSTANTS[path],
// }

// export default getConst

// module.exports = getConst