const fs = require('fs-extra'),
  path = require('path'),
  moment = require('moment'),
  _ = require('lodash'),
  klawSync = require('klaw-sync'),
  CONSTS = require('../packs/lib/constants')

function todayBackupExists(backupFolder, ext) {
  // возможно не будет работать на Linux из-за отсутствия birthtime !!!
  const filterFn = item => (item.stats.birthtime.getDate() === new Date().getDate()) && (path.extname(item.path) === ext)

  let paths = klawSync(backupFolder, {filter: filterFn})

  return paths.length > 0
}

function createBackup(filePath, backupFolder) {
  let fileExt = path.extname(filePath),
    fileName = path.basename(filePath, path.extname(filePath))

  let backupName = fileName + ' ' + moment().format(CONSTS.FORMATS.shortDate) + fileExt,
    backupPath = path.join(backupFolder, backupName)

  try {
    fs.copySync(filePath, backupPath)
    return true
  } catch (err) {
    console.error('Ошибка при создании резервной копии!"')
    console.error(err)
    return false
  }
}

function deleteOldBackupsExceptAmount(backupFolder, ext, amount) {
  const filterFn = item => (path.extname(item.path) === ext)

  let paths = klawSync(backupFolder, {filter: filterFn})
  paths = _.sortBy(paths, (file) => {return path.basename(file.path)}).reverse()

  paths.forEach((file, i) => {
    if (i >= amount) {
      fs.removeSync(file.path)
    }
  })
}

module.exports.createBackup = createBackup
module.exports.todayBackupExists = todayBackupExists
module.exports.deleteOldBackupsExceptAmount = deleteOldBackupsExceptAmount