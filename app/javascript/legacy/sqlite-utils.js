let sqlite = require('sqlite3')

import {encryptObj, decryptArrayOfObj} from './crypto'

/////////////////
export function createDBConnection(path) {
  return new Promise(function (resolve, reject) {
    let db = new sqlite.Database(path)
    // console.log(db)
//////////////////

    db.addDemoData = function () {
      this.exec(`INSERT INTO tickets (medicId, patientName, date, createdAt)
          VALUES (1, 'Иванов В.С.','2017-09-26', '2013-10-07T08:23:19.120Z'),
                  (1, 'Петров','2017-09-27', '2013-10-07T08:23:19.120Z'),
                  (1, 'Сидоров','2017-08-26', '2013-10-07T08:21:19.120Z'),
                  (2, 'Петров','2017-08-20', '2013-10-07T08:20:19.120Z');`, (err) => {
        console.log('Table "tickets" was filled with demo data', err)
      })
        // .exec(`INSERT INTO medics (name, managerId) VALUES
        // ('Врач 1', 2),
        // ('Врач 2', 2),
        // ('Врач 3', 2),
        // ('Врач c фамилией из >25 символов', 6);`, (err) => {
        //   console.log('Table "medics" was filled with demo data', err)
        // })
        // .exec(`INSERT INTO managers (name) VALUES ('Медик'), ('Менеджер 1'), ('Менеджер 2'), ('Менеджер 3');`, (err) => {
        //   console.log('Table "managers" was filled with demo data', err)
        // })
        .exec(`INSERT INTO [payments] (serviceId, managerId, value)
      VALUES (1,1,'100'), (2,1,'100'), (3,1,'100'), (4,1,'10'), (1,2,'10'), (1,3,'10'), (1,4,'10');`, (err) => {
          console.log('Table "payments" was filled with demo data', err)
        })
        .exec(`INSERT INTO services (code, name, surgery)
        VALUES ('5.010', 'Операция 1',1),
         ('5.011', 'Операция 2',1),
         ('5.0310', 'Операция 3',1),
         ('5.0311', 'Операция 4',1),
         ('5.020', 'Диагностика 1',0),
         ('5.021', 'Диагностика 2',0),
         ('5.0420', 'Диагностика 3',0),
         ('5.0421', 'Диагностика 4',0);`, (err) => {
          console.log('Table "services" was filled with demo data', err)
        })
        .exec(`INSERT INTO services_to_tickets (ticketId, serviceId) VALUES (1,1), (1,2), (2,3), (3,1);`, (err) => {
          console.log('Table "services_to_tickets" was filled with demo data', err)
        })
    }
    // db.createEmptyDB = function () {
    //   this.exec(`DROP TABLE IF EXISTS settings;
    //     DROP TABLE IF EXISTS reports;
    //     DROP TABLE IF EXISTS tickets;
    //     DROP TABLE IF EXISTS medics;
    //     DROP TABLE IF EXISTS managers;
    //     DROP TABLE IF EXISTS payments;
    //     DROP TABLE IF EXISTS services;
    //     DROP TABLE IF EXISTS services_to_tickets;`)
        // .exec(`CREATE TABLE [tickets](
        // [id] INTEGER PRIMARY KEY NOT NULL UNIQUE,
        // [medicId] INTEGER NOT NULL,
        // [patientName] VARCHAR(250),
        // [date] DATE NOT NULL,
        // [createdAt] TIMESTAMP NOT NULL,
        // [active] BOOLEAN NOT NULL DEFAULT 1
        // );`, (err) => {
        //   console.log('Table "tickets" was recreated', err)
        // })
        // .exec(`CREATE TABLE [medics](
        // [id] INTEGER PRIMARY KEY NOT NULL UNIQUE,
        // [name] VARCHAR(250) NOT NULL UNIQUE,
        // [active] BOOLEAN NOT NULL DEFAULT 1,
        // [managerId] INTEGER NOT NULL
        // );`, (err) => {
        //   console.log('Table "medics" was recreated', err)
        // })
        // .exec(`CREATE TABLE [managers](
        // [id] INTEGER PRIMARY KEY NOT NULL UNIQUE,
        // [name] VARCHAR(250) NOT NULL UNIQUE,
        // [active] BOOLEAN NOT NULL DEFAULT 1
        // );`, (err) => {
        //   console.log('Table "medics" was recreated', err)
        // })
        // .exec(`CREATE TABLE [payments](
        // [id] INTEGER PRIMARY KEY NOT NULL UNIQUE,
        // [serviceId] INTEGER NOT NULL,
        // [managerId] INTEGER NOT NULL,
        // [value] FLOAT NOT NULL);
        //
        // CREATE UNIQUE INDEX [type_index]
        // ON [payments](
        //     [serviceId],
        //     [managerId]);
        // `, (err) => {
        //   console.log('Table "payments" was recreated', err)
        // })
        // .exec(`CREATE TABLE [services](
        // [id] INTEGER PRIMARY KEY NOT NULL UNIQUE,
        // [code] VARCHAR(20) NOT NULL UNIQUE,
        // [name] VARCHAR(250) NOT NULL UNIQUE,
        // [surgery] BOOLEAN NOT NULL DEFAULT 0,
        // [active] BOOLEAN NOT NULL DEFAULT 1
        // );`, (err) => {
        //   console.log('Table "services" was recreated', err)
        // })
        // .exec(`CREATE TABLE [services_to_tickets](
        // [id] INTEGER PRIMARY KEY NOT NULL UNIQUE,
        // [ticketId] INTEGER NOT NULL,
        // [serviceId] INTEGER NOT NULL
        // );`, (err) => {
        //   console.log('Table "services_to_tickets" was recreated', err)
        // })
    // }
    db.queryAll = function (sql, params, keysToExclude) {
      return new Promise(function (resolve, reject) {
        // console.log(params, encryptObj(params))
        db.all(sql, encryptObj(params, keysToExclude), function cb(err, rows) {
          if (err) {
            reject(err)
          } else {
            // console.log(rows, decryptArrayOfObj(rows))
            resolve(decryptArrayOfObj(rows, keysToExclude))
          }
        })
      })
    }
    db.queryRun = function (sql, params, keysToExclude) {
      return new Promise(function (resolve, reject) {
        db.run(sql, encryptObj(params, keysToExclude), function cb(err) {
          if (err) {
            reject(err)
          } else {
            let result = {
              lastID: this.lastID,
              changes: this.changes
            }
            resolve(result)
          }
        })
      })
    }

    resolve(db)
  })
}

export function createEmptyDB(db) {
  db.exec(`DROP TABLE IF EXISTS settings;
        DROP TABLE IF EXISTS reports;
        DROP TABLE IF EXISTS tickets;
        DROP TABLE IF EXISTS medics;
        DROP TABLE IF EXISTS managers;
        DROP TABLE IF EXISTS payments;
        DROP TABLE IF EXISTS services;
        DROP TABLE IF EXISTS services_to_tickets;`)
    // .exec(`CREATE TABLE [settings](
    //     [key] VARCHAR(250) PRIMARY KEY NOT NULL UNIQUE,
    //     [value] VARCHAR(250) NOT NULL);`, (err) => {
    //   console.log('Table "settings" was recreated', err)
    // })
    // .exec(`INSERT INTO settings VALUES ('masterPass', '6'),
    //  ('dbVersion', '1.0.0'),
    //  ('httpPort', '3000'),
    //  ('spreadsheetAppPathWindows','C:\\\\Program Files (x86)\\\\OpenOffice 4\\\\program\\\\scalc.exe');`, (err) => {
    //   console.log('Default settings were applied', err)
    // })
    // .exec(`CREATE TABLE [tickets](
    //     [id] INTEGER PRIMARY KEY NOT NULL UNIQUE,
    //     [medicId] INTEGER NOT NULL,
    //     [patientName] VARCHAR(250),
    //     [date] DATE NOT NULL,
    //     [createdAt] TIMESTAMP NOT NULL,
    //     [active] BOOLEAN NOT NULL DEFAULT 1
    //     );`, (err) => {
    //   console.log('Table "tickets" was recreated', err)
    // })
    // .exec(`CREATE TABLE [medics](
    //     [id] INTEGER PRIMARY KEY NOT NULL UNIQUE,
    //     [name] VARCHAR(250) NOT NULL UNIQUE,
    //     [active] BOOLEAN NOT NULL DEFAULT 1,
    //     [managerId] INTEGER NOT NULL
    //     );`, (err) => {
    //   console.log('Table "medics" was recreated', err)
    // })
    // .exec(`CREATE TABLE [managers](
    //     [id] INTEGER PRIMARY KEY NOT NULL UNIQUE,
    //     [name] VARCHAR(250) NOT NULL UNIQUE,
    //     [active] BOOLEAN NOT NULL DEFAULT 1
    //     );`, (err) => {
    //   console.log('Table "medics" was recreated', err)
    // })
    // .exec(`CREATE TABLE [payments](
    //     [id] INTEGER PRIMARY KEY NOT NULL UNIQUE,
    //     [serviceId] INTEGER NOT NULL,
    //     [managerId] INTEGER NOT NULL,
    //     [value] FLOAT NOT NULL);
    //
    //     CREATE UNIQUE INDEX [type_index]
    //     ON [payments](
    //         [serviceId],
    //         [managerId]);
    //     `, (err) => {
    //   console.log('Table "payments" was recreated', err)
    // })
    // .exec(`CREATE TABLE [services](
    //     [id] INTEGER PRIMARY KEY NOT NULL UNIQUE,
    //     [code] VARCHAR(20) NOT NULL UNIQUE,
    //     [name] VARCHAR(250) NOT NULL UNIQUE,
    //     [surgery] BOOLEAN NOT NULL DEFAULT 0,
    //     [active] BOOLEAN NOT NULL DEFAULT 1
    //     );`, (err) => {
    //   console.log('Table "services" was recreated', err)
    // })
    // .exec(`CREATE TABLE [services_to_tickets](
    //     [id] INTEGER PRIMARY KEY NOT NULL UNIQUE,
    //     [ticketId] INTEGER NOT NULL,
    //     [serviceId] INTEGER NOT NULL
    //     );`, (err) => {
    //   console.log('Table "services_to_tickets" was recreated', err)
    // })
    // .exec(`CREATE TABLE [reports](
    //     [id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
    //     [createdAt] TIMESTAMP NOT NULL,
    //     [type] VARCHAR2(255) NOT NULL,
    //     [content] BLOB NOT NULL);
    //     `, (err) => {
    //   console.log('Table "reports" was recreated', err)
    // })
}