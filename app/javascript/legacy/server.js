const Hapi = require('hapi'),
  _ = require('lodash'),
  moment = require('moment'),
  path = require('path'),
  Excel = require('exceljs'),
  fs = require('fs-extra'),
  child_process = require('child_process')

const server = new Hapi.Server(),
  constants = require('../packs/lib/constants'),
  fs_manager = require("./fs-manager"),
  backup_manager = require("./backup-manager"),
  common_utils = require('../packs/lib/common-utils'),
  sqlite_utils = require('./sqlite-utils'),
  xlsx_utils = require('./xlsx-utils'),
  {APP_FOLDER, CONFIG} = require('./settings-loader'),
  {responseHandle, localhostCheck} = require('./hapi-utils')

const SETTINGS = {
  APP_FOLDER: APP_FOLDER,
  CONFIG: CONFIG,
  BACKUPS_FOLDER: path.join(APP_FOLDER, 'backups'),
  TEMP_FOLDER: path.join(APP_FOLDER, 'temp'),
  DB_PATH: path.join(APP_FOLDER, 'db.db'),
};

(function createFoldersAndCheckDBFile() {
  fs_manager.removeAndCreateFolder(SETTINGS.TEMP_FOLDER)
  fs_manager.createFolder(SETTINGS.BACKUPS_FOLDER)
  if (!fs_manager.checkIfFileExistsAndWriteLog(SETTINGS.DB_PATH, 'Не найден файл базы данных!')) {
    process.exit(1)
  }
})();
(function CheckAndCreateBackupIfNeed() {
  if (!backup_manager.todayBackupExists(SETTINGS.BACKUPS_FOLDER, '.db')) {
    if (backup_manager.createBackup(SETTINGS.DB_PATH, SETTINGS.BACKUPS_FOLDER)) {
      backup_manager.deleteOldBackupsExceptAmount(SETTINGS.BACKUPS_FOLDER, 14)
    }
  }
})()

let db;

async function saveReportThenOpenItAndDeleteAfterClose(workbook, type) {
  // let content = new Buffer.from(JSON.stringify(workbook))
  // await saveReportInDB(reportType, content)

  let datetime = moment().format(constants.FORMATS.shortDatetime),
    reportName = `${type} ${datetime}.xlsx`,
    reportPath = path.join(SETTINGS.TEMP_FOLDER, reportName)

  workbook.xlsx.writeFile(reportPath)
    .then(async function () {
      await startSpreadsheetAppAndDeleteFileAfterClose(reportPath)
    })
}

async function startSpreadsheetAppAndDeleteFileAfterClose(reportPath) {
  let spreadsheetAppKey = 'spreadsheetAppPath'

  if (process.platform === 'win32') {
    spreadsheetAppKey = spreadsheetAppKey + 'Windows'
  } else {
    spreadsheetAppKey = spreadsheetAppKey + 'Linux'
  }

  let spreadSheetAppPath = await db.queryAll(`SELECT value FROM settings WHERE key = $app`,
    {$app: spreadsheetAppKey}, ['app'])
  spreadSheetAppPath = spreadSheetAppPath[0].value

  if (spreadSheetAppPath) {
    spreadSheetAppPath = path.normalize(spreadSheetAppPath)
    // C:\\Program Files (x86)\\OpenOffice 4\\program\\scalc.exe

    child_process.execFile(spreadSheetAppPath, [reportPath], (err) => {
      fs.removeSync(reportPath)

      if (err) {
        console.error(err)
        throw err
      }
    })
  }
}

// START
(async function () {
  db = await sqlite_utils.createDBConnection(SETTINGS.DB_PATH)
  // db.createEmptyDB()
  // db.addDemoData()

  let httpPort = await db.queryAll(`SELECT value FROM settings WHERE key = 'httpPort'`)
  // console.log(httpPort)
  httpPort = httpPort[0].value

  if (!httpPort) {
    httpPort = 3000
    let message = 'Не найдено значение http-порта в базе данных! Используется порт по умолчанию'
    console.log(message)
    fs_manager.writeLog(APP_FOLDER, message)
  }

  server.connection({
    port: httpPort,
    // address: '0.0.0.0',
    address: 'localhost',
    routes: {cors: true}
  })

  server.register(require('inert'), (err) => {
    if (err) {
      throw err
    }

    server.route([
      {
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
          reply.file(`${__dirname}/static/index.html`)
        }
      },
      {
        method: 'GET',
        path: '/{param*}',
        handler: {
          directory: {
            path: path.normalize(path.join(__dirname, 'static'))
          }
        }
      }
    ])
  })

  server.route([
    {
      path: '/api/login/user',
      method: 'GET',
      handler: async function (request, reply) {
        async function cb() {
          return constants.SUCCESSFUL_RESPONSE
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/login/master',
      method: 'GET',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let params = {
            $password: request.query.password
          }

          let settings = await db.queryAll(`SELECT COUNT(value) AS 'value' FROM settings 
          WHERE key = 'masterPass' AND value = $password`, params)

          let response = ''

          if (settings[0].value > 0)
            response = constants.SUCCESSFUL_RESPONSE
          else
            response = 'Wrong password'

          return response
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/medics/user',
      method: 'GET',
      handler: async function (request, reply) {
        async function cb() {

          let medics = await db.queryAll('SELECT id, name FROM medics WHERE active = 1 ORDER BY name')
          medics = _.sortBy(medics, 'name')
          return medics
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/services/user',
      method: 'GET',
      handler: async function (request, reply) {
        async function cb() {
          let services = await db.queryAll('SELECT id, name, code, surgery ' +
            'FROM services WHERE active = 1 ORDER BY code', {}, ['name', 'code'])
          return services
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/tickets',
      method: 'POST',
      handler: async function (request, reply) {
        /*request.payload: {
        patientName: '',
        date: '',
        services: []
        }*/
        async function cb() {
          let payload = request.payload,
            params = {
              $patientName: _.capitalize(payload.patientName),
              $medicId: payload.medicId,
              $date: moment(payload.date).format('Y-MM-DD'),
              $createdAt: moment().format()
            }

          let newTicket = await db.queryRun(`INSERT INTO tickets (medicId, patientName, date, createdAt)
          VALUES ($medicId, $patientName, $date, $createdAt)`, params)

          for (let service of payload.services) {
            await db.queryRun(`INSERT INTO services_to_tickets (ticketId, serviceId) VALUES ($ticketId, $serviceId)`,
              {
                $ticketId: newTicket.lastID,
                $serviceId: service
              }
            )
          }
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/tickets',
      method: 'PATCH',
      handler: async function (request, reply) {
        async function cb() {
          let params = {
            $id: request.payload.id,
            $active: request.payload.active ? 1 : 0
          }
          let result = await db.queryRun(`UPDATE tickets SET active = $active WHERE id = $id`, params)
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/tickets/list',
      method: 'GET',
      handler: async function (request, reply) {
        async function cb() {
          let params = {
              $dateMonth: moment(request.query.dateMonth).format('MM-Y'),
              $medicId: request.query.medicId === '0' ? '%' : request.query.medicId,
              $showDeleted: request.query.showDeleted === 'true' ? '%' : 1,
              $showSurgical: request.query.showSurgical === 'true' ? '%' : 0,
            },
            query = `SELECT t.id, t.active, m.name, t.patientName, t.date, t.createdAt,
              GROUP_CONCAT(s.code || ' - ' || s.name, '\n') AS services
              FROM tickets t
              JOIN medics m ON t.medicId = m.id
              LEFT JOIN services_to_tickets st on t.id = st.ticketId
              LEFT JOIN services s on st.serviceId = s.id
              WHERE (t.active LIKE $showDeleted 
              AND m.id LIKE $medicId
              AND strftime('%m-%Y',t.date) = $dateMonth 
              AND s.surgery LIKE $showSurgical)
              GROUP BY t.id
              ORDER BY t.date DESC, t.createdAt DESC`

          let tickets = await db.queryAll(query, params, ['dateMonth', 'showDeleted', 'services', 'showSurgical', 'medicId'])

          return tickets
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/tickets/report',
      method: 'GET',
      handler: async function (request, reply) {
        async function cb() {
          async function getColumns(params) {
            let columns = []

            columns.push({
              title: 'Врач',
              key: 'name',
              width: 250,
              sortable: true,
              fixed: 'left'
            })

            let queryColumns = await db.queryAll(`SELECT s.code AS 'code'
               FROM tickets t
               JOIN services_to_tickets st on t.id = st.ticketId
               JOIN services s on st.serviceId = s.id
               WHERE t.date BETWEEN $dateFrom AND $dateBy
               AND t.active = 1
               GROUP BY s.code
               ORDER BY s.code`, params)

            for (let column of queryColumns) {
              columns.push({
                title: column.code,
                key: column.code,
                width: 80,
                align: 'center'
              })
            }

            columns.push({
              title: 'Всего',
              key: 'summary',
              width: 60,
              align: 'center',
              sortable: true,
              fixed: 'right'
            })

            return columns
          }

          async function getTableData(params) {
            async function getMedicData(medic, params) {
              params.$id = medic.id

              let amounts = await db.queryAll(`SELECT COUNT(m.name) AS amount, s.code
                FROM tickets t
                JOIN medics m ON t.medicId = m.id
                JOIN services_to_tickets st on t.id = st.ticketId
                JOIN services s on st.serviceId = s.id
                WHERE (m.id = $id) AND (t.date BETWEEN $dateFrom AND $dateBy) AND (t.active = 1)
                GROUP BY m.name, s.code`, params)

              medic.summary = 0

              for (let item of amounts) {
                medic[item.code] = item.amount
                medic.summary += item.amount
              }

              return medic
            }

            let data = [],
              medics = await db.queryAll(`SELECT DISTINCT m.name, m.id
               FROM tickets t
               JOIN medics m ON m.id = t.medicId
               WHERE (t.date BETWEEN $dateFrom AND $dateBy AND t.active = 1)
               ORDER BY m.name`, params)

            for (let medic of medics) {
              medic = await getMedicData(medic, params)

              data.push(medic)
            }

            data = _.sortBy(data, 'name')

            return data
          }

          localhostCheck(request)

          let params = {
              $dateFrom: moment(request.query.dateFrom).add(-1, 'days').format('Y-MM-DD'),
              $dateBy: moment(request.query.dateBy).format('Y-MM-DD')
            },
            table = constants.EMPTY_TABLE

          table.columns = await getColumns(params)
          table.data = await getTableData(params)

          return {table: table}
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/tickets/report',
      method: 'POST',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let payload = request.payload,
            dateFrom = moment(payload.dateFrom).format(constants.FORMATS.shortDate),
            dateBy = moment(payload.dateBy).format(constants.FORMATS.shortDate),
            title = `Отчет по направлениям с ${dateFrom} по ${dateBy}`,
            headers = []

          let workbook = new Excel.Workbook(),
            worksheet = xlsx_utils.createWorksheet(workbook, 'Направления')

          payload.columns.forEach(column => {
            headers.push({
              header: column.title,
              key: column.key,
              width: column.title === 'Врач' ? 25 : 7
            })
          })

          xlsx_utils.createBorderedColumns(worksheet, headers)
          xlsx_utils.addTopRow(worksheet, [title], 'A1:E1')
          worksheet.addRows(payload.rows)

          await saveReportThenOpenItAndDeleteAfterClose(workbook, 'Направления')

          // let content = new Buffer.from(JSON.stringify(workbook))
          // await saveReportInDB('Направления', content)
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/payments/report',
      method: 'GET',
      handler: async function (request, reply) {
        async function cb() {
          async function getReportMedics(params) {
            async function getMedicData(medic, params) {
              params.$medicId = medic.id

              medic.services = await db.queryAll(`SELECT t.patientName, s.name AS 'serviceName',COUNT(*) as 'amount',
              (SELECT value FROM payments WHERE (serviceId = s.id) AND (managerId = 1)) AS 'payment'
              FROM tickets t
              JOIN services_to_tickets st ON t.id = st.ticketId
              JOIN services s ON st.serviceId = s.id
              JOIN medics m ON t.medicId = m.id
              WHERE (m.id = $medicId) AND (t.active = 1) AND (t.date BETWEEN $dateFrom AND $dateBy)
              GROUP BY s.name, t.patientName
              ORDER BY s.surgery DESC, t.patientName`, params, ['serviceName'])

              medic.summary = 0
              medic.subcolumns = [
                {
                  title: 'ФИО пациента',
                  key: 'patientName',
                  width: 120,
                }, {
                  title: 'Услуга',
                  key: 'serviceName',
                  width: 565,
                }, {
                  title: 'Кол-во',
                  key: 'amount',
                  width: 35,
                }, {
                  title: 'Выплата',
                  key: 'payment',
                  width: 55,
                }]

              for (let service of medic.services) {
                medic.summary += service.payment * service.amount
              }

              return medic
            }

            let data = []

            let medics = await db.queryAll(`SELECT DISTINCT m.name, m.id, mg.name AS 'manager'
            FROM medics m
            JOIN tickets t ON t.medicId = m.id
            JOIN managers mg ON m.managerId = mg.id
            WHERE t.active = 1 
            AND t.date BETWEEN $dateFrom AND $dateBy
            AND mg.id LIKE $managerId
            ORDER BY mg.id, m.name`, params)

            delete params.$managerId

            for (let medic of medics) {
              medic = await getMedicData(medic, params)

              data.push(medic)
            }

            return data
          }

          async function getReportManagers(params) {
            async function getManagerData(manager, params) {
              params.$managerId = manager.id

              manager.services = await db.queryAll(`SELECT serviceName, payment, amount, payment * amount AS presummary
              FROM (
                   SELECT s.name AS 'serviceName',
                  (SELECT value FROM payments WHERE (serviceId = s.id AND managerId = $managerId)) AS 'payment',
                  COUNT(s.name) AS 'amount'
                  FROM tickets t
                  JOIN services_to_tickets st ON t.id = st.ticketId
                  JOIN services s ON st.serviceId = s.id
                  JOIN medics m ON t.medicId = m.id
                  JOIN managers mg ON mg.id = m.managerId
                  WHERE (mg.id = $managerId 
                  AND t.active = 1 
                  AND t.date BETWEEN $dateFrom AND $dateBy)
                  GROUP BY serviceName
                  ORDER BY s.surgery DESC
              )`, params, ['serviceName'])

              manager.summary = 0
              manager.subcolumns = [
                {
                  key: 'serviceName',
                  width: 550,
                }, {
                  key: 'amount',
                  width: 50,
                  align: 'center'
                }, {
                  key: 'payment',
                  width: 80,
                  align: 'center'
                }, {
                  key: 'presummary',
                  width: 80,
                  align: 'center'
                }]

              for (let service of manager.services) {
                manager.summary += service.presummary
              }

              return manager
            }

            params.$managerHomeName = 'Поликлиника'
            let data = []

            let managers = await db.queryAll(`SELECT DISTINCT mg.name, mg.id
            FROM tickets t
            JOIN medics m ON t.medicId = m.id
            JOIN managers mg ON mg.id = m.managerId
            WHERE (mg.name != $managerHomeName
            AND t.active = 1 
            AND t.date BETWEEN $dateFrom AND $dateBy)`, params)

            delete params.$managerHomeName
            for (let manager of managers) {
              let managerData = await getManagerData(manager, params)

              data.push(managerData)
            }

            return data
          }

          async function getReportHomeMedics(params) {
            async function getMedicData(medic, params) {
              params.$medicId = medic.id

              medic.services = await db.queryAll(`SELECT serviceName, payment, amount, payment * amount AS presummary
              FROM (
                   SELECT s.name AS 'serviceName',
                  (SELECT value FROM payments WHERE (serviceId = s.id AND managerId = 1)) AS 'payment',
                  COUNT(s.name) AS 'amount'
                  FROM tickets t
                  JOIN services_to_tickets st ON t.id = st.ticketId
                  JOIN services s ON st.serviceId = s.id
                  JOIN medics m ON t.medicId = m.id
                  WHERE (m.id = $medicId AND t.active = 1 AND t.date BETWEEN $dateFrom AND $dateBy)
                  GROUP BY serviceName
                  ORDER BY s.surgery DESC
              )`, params, ['serviceName'])

              medic.summary = 0
              medic.subcolumns = [
                {
                  key: 'serviceName',
                  width: 550,
                }, {
                  key: 'amount',
                  width: 50,
                  align: 'center'
                }, {
                  key: 'payment',
                  width: 80,
                  align: 'center'
                }, {
                  key: 'presummary',
                  width: 80,
                  align: 'center'
                }]

              for (let service of medic.services) {
                medic.summary += service.presummary
              }

              return medic
            }

            params.$homeManagerName = 'Поликлиника'

            let data = []
            let medics = await db.queryAll(`SELECT DISTINCT m.name, m.id
            FROM tickets t
            JOIN medics m ON t.medicId = m.id
            JOIN managers mg ON m.managerId = mg.id
            WHERE (mg.name = $homeManagerName AND t.active = 1 AND t.date BETWEEN $dateFrom AND $dateBy)`, params)

            delete params.$homeManagerName

            for (let medic of medics) {
              let medicData = await getMedicData(medic, params)
              data.push(medicData)
            }

            data = _.sortBy(data, 'name')
            return data
          }

          localhostCheck(request)

          let params = {
              $dateFrom: moment(request.query.dateFrom).add(-1, 'days').format(),
              $dateBy: moment(request.query.dateBy).format(),
              $managerId: request.query.managerId === '0' ? '%' : request.query.managerId,
            },
            table = constants.EMPTY_TABLE,
            reportType = request.query.reportType

          if (reportType === 'medics') {
            table.data = await getReportMedics(params)
          } else if (reportType === 'managers') {
            table.data = await getReportManagers(params)
          } else {
            table.data = await getReportHomeMedics(params)
          }

          table.data = _.sortBy(table.data, 'name')

          return {table: table}
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/payments/report',
      method: 'POST',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let payload = request.payload

          let dateFrom = moment(payload.dateFrom).format(constants.FORMATS.shortDate),
            dateBy = moment(payload.dateBy).format(constants.FORMATS.shortDate),
            title = `Отчет по выплатам с ${dateFrom} по ${dateBy}`,
            headers = [],
            columnsToMerge = [],
            summaryEmptyColsCount = 0

          let reportType = ''

          if (payload.reportType === 'medics') {
            reportType = 'Врачи'
            headers = [
              {
                header: "ФИО",
                key: 'name',
                width: 35
              },
              {
                header: "Менеджер",
                key: 'manager',
                width: 18
              },
              {
                header: "ФИО пациента",
                key: 'patientName',
                width: 20
              },
              {
                header: "Название услуги",
                key: 'serviceName',
                width: 40
              }, {
                header: "Кол-во",
                key: 'amount',
                width: 8
              },
              {
                header: "Выплата",
                key: 'payment',
                width: 10
              },
              {
                header: "Всего",
                key: 'summary',
                width: 10
              },
            ]
            columnsToMerge = ['A', 'G']
            summaryEmptyColsCount = 5
          } else if (payload.reportType === 'managers') {
            reportType = 'Менеджеры'
            headers = [
              {
                header: "ФИО",
                key: 'name',
                width: 20
              }, {
                header: "Название услуги",
                key: 'serviceName',
                width: 80
              }, {
                header: "Кол-во",
                key: 'amount',
                width: 10
              }, {
                header: "Выплата",
                key: 'payment',
                width: 10
              }, {
                header: "Итог",
                key: 'presummary',
                width: 10
              }, {
                header: "Всего",
                key: 'summary',
                width: 10
              },
            ]
            columnsToMerge = ['A', 'F']
            summaryEmptyColsCount = 4
          } else if (payload.reportType === 'homeMedics') {
            reportType = 'Врачи поликлиники'
            headers = [
              {
                header: "ФИО",
                key: 'name',
                width: 30
              }, {
                header: "Название услуги",
                key: 'serviceName',
                width: 70
              }, {
                header: "Кол-во",
                key: 'amount',
                width: 10
              }, {
                header: "Выплата",
                key: 'payment',
                width: 10
              }, {
                header: "Итог",
                key: 'presummary',
                width: 10
              }, {
                header: "Всего",
                key: 'summary',
                width: 10
              },
            ]
            columnsToMerge = ['A', 'F']
            summaryEmptyColsCount = 4
          }

          let workbook = new Excel.Workbook(),
            worksheet = xlsx_utils.createWorksheet(workbook, reportType)

          xlsx_utils.createBorderedColumns(worksheet, headers, [],)

          let newRows = common_utils.flattenArrayOfObjects(payload.rows, 'services')
          worksheet.addRows(newRows)

          xlsx_utils.addTopRow(worksheet, [title])
          xlsx_utils.mergeCellsByKey(worksheet, newRows, 'name', columnsToMerge, 3)
          xlsx_utils.addSummary(worksheet, payload.total, summaryEmptyColsCount)
          xlsx_utils.setColumnsTextWrap(worksheet, columnsToMerge)
          xlsx_utils.setRowsMediumBorderByColumnKey(worksheet, 'A', 3)

          await saveReportThenOpenItAndDeleteAfterClose(workbook, `Выплаты ${reportType}`)
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/medics',
      method: 'GET',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let medics = await db.queryAll(`SELECT med.id, med.name, man.name as manager, med.active
            FROM medics med
            JOIN managers man ON med.managerId = man.id
            ORDER BY med.name`)

          medics = _.sortBy(medics, 'name')
          return medics
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/medics',
      method: 'POST',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let payload = request.payload,
            params = {
              $name: payload.name,
              $managerId: payload.managerId,
              $active: payload.active ? 1 : 0
            }

          let result = await db.queryRun(`INSERT INTO medics (name, managerId, active) 
            VALUES ($name, $managerId, $active)`, params)
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/medics',
      method: 'PATCH',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let payload = request.payload,
            params = {
              $name: payload.name,
              $managerId: payload.managerId,
              $active: payload.active ? 1 : 0,
              $id: payload.id
            }

          let result = await db.queryRun(`UPDATE medics 
            SET name=$name, managerId=$managerId, active=$active WHERE id=$id`, params)
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/managers',
      method: 'GET',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let managers = await db.queryAll(`SELECT id, name, active FROM managers ORDER BY name`)
          managers = _.sortBy(managers, 'name')
          return managers
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/managers/active',
      method: 'GET',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let managers = await db.queryAll(`SELECT id, name, active FROM managers WHERE active = 1 ORDER BY name`)
          managers = _.sortBy(managers, 'name')
          return managers
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/managers/report',
      method: 'GET',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let managers = await db.queryAll(`SELECT id, name FROM managers WHERE (id != 1)`)
          managers = _.sortBy(managers, 'name')
          managers.splice(0, 0, {id: 0, name: 'Все'})
          return managers
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/managers',
      method: 'POST',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let payload = request.payload,
            params = {
              $name: payload.name,
              $active: payload.active ? 1 : 0
            }

          let result = await db.queryRun(`INSERT INTO managers (name, active) 
            VALUES ($name, $active)`, params)
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/managers',
      method: 'PATCH',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let payload = request.payload,
            params = {
              $name: payload.name,
              $active: payload.active ? 1 : 0,
              $id: payload.id
            }

          let result = await db.queryRun(`UPDATE managers SET name = $name, active = $active WHERE id = $id`, params)
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/services',
      method: 'GET',
      handler: async function (request, reply) {
        async function cb() {
          async function getServiceData(service, managers) {
            let payments = await db.queryAll(`SELECT p.serviceId, p.value, m.name as managerName
              FROM payments p
              JOIN managers m ON p.managerId = m.id
              WHERE p.serviceId = $id`, {$id: service.id})

            for (let payment of payments) {
              service[payment.managerName] = payment.value
            }

            for (let manager of managers) {
              if (service[manager.name] === undefined) service[manager.name] = '-'
            }

            return service
          }

          localhostCheck(request)

          let managers = await db.queryAll(`SELECT DISTINCT m.name 
            FROM managers m JOIN payments p ON m.id = p.managerId ORDER BY m.id`)

          let services = await db.queryAll(`SELECT * FROM services ORDER BY code`, {}, ['name', 'code'])
          let data = []

          for (let service of services) {
            service = await getServiceData(service, managers)
            data.push(service)
          }

          let table = {
            managers: managers,
            data: data
          }

          return {table: table}
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/services',
      method: 'POST',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let payload = request.payload,
            params = {
              $code: payload.code,
              $name: payload.name,
              $active: payload.active ? 1 : 0,
              $surgery: payload.surgery ? 1 : 0
            }

          let result = await db.queryRun(`INSERT INTO services (code, name, surgery, active) 
            VALUES ($code, $name, $surgery, $active)`, params, ['name', 'code'])
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/services',
      method: 'PATCH',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let payload = request.payload,
            params = {
              $code: payload.code,
              $name: payload.name,
              $active: payload.active ? 1 : 0,
              $surgery: payload.surgery ? 1 : 0,
              $id: payload.id
            }

          let result = await db.queryRun(`UPDATE services 
            SET name = $name, code = $code, surgery = $surgery, active = $active 
            WHERE id = $id`, params, ['name', 'code'])
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/payments',
      method: 'PUT',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let payload = request.query,
            params = {
              $serviceId: payload.serviceId,
              $managerId: payload.managerId,
              $value: payload.value
            }

          // обновление либо добавление записи в payments
          let result = await db.queryRun(`UPDATE payments SET value = $value 
            WHERE (serviceId = $serviceId) AND (managerId = $managerId)`, params, ['value'])

          result = await db.queryRun(`INSERT OR IGNORE INTO payments (serviceId, managerId, value) 
            VALUES ($serviceId, $managerId, $value)`, params, ['value'])

          return constants.SUCCESSFUL_RESPONSE
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/settings',
      method: 'GET',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let settings = await db.queryAll(`SELECT key,
           CASE WHEN key = 'masterPass' THEN '' ELSE value END AS value 
           FROM settings ORDER BY key`, {}, ['key'])

          return settings
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/settings',
      method: 'POST',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let payload = request.payload,
            params = {
              $key: payload.key,
              $value: payload.value
            }

          let result = await db.queryRun(`INSERT INTO settings (key, value) VALUES ($key, $value)`, params, ['key'])
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/settings',
      method: 'PATCH',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let payload = request.payload,
            params = {
              $key: payload.key,
              $value: payload.value
            }

          let result = await db.queryRun(`UPDATE settings SET key = $key, value = $value WHERE key = $key`, params, ['key'])
        }

        responseHandle(request, reply, cb)
      }
    },
    {
      path: '/api/settings',
      method: 'DELETE',
      handler: async function (request, reply) {
        async function cb() {
          localhostCheck(request)

          let payload = request.payload,
            params = {
              $key: payload.key
            }

          if (['dbVersion', 'masterPass', 'httpPort'].includes(payload.key)) {
            throw {message: 'Выбранный параметр нельзя удалить!'}
          } else {
            await db.queryRun(`DELETE FROM settings WHERE key = $key`, params, ['key'])
          }
        }

        responseHandle(request, reply, cb)
      }
    },
  ])

  server.start((err) => {
    if (err) {
      throw err
    }

    console.log(`Server running at: ${server.info.uri}`)
  })
})()