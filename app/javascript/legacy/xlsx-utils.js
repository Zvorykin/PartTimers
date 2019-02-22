let _ = require('lodash')

function createWorksheet(workbook, name, props) {
  let defaultProps = {
    pageSetup: {
      paperSize: 9,
      orientation: 'landscape',
      margins: {
        top: 0.23622,
        right: 0.23622,
        bottom: 0.23622,
        left: 0.23622,
        header: 0.23622,
        footer: 0.23622
      }
    }
  }

  props = _.defaultsDeep(props, defaultProps)
  let worksheet = workbook.addWorksheet(name, props)

  return worksheet
}

function setRowHeaderStyle(row) {
  row.alignment = {
    horizontal: 'center'
  }

  row.font = {
    name: 'Calibri',
    bold: true
  }
}

function createBorderedColumns(worksheet, columns) {
  worksheet.columns = columns

  worksheet.columns.forEach((col, i) => {
    let curColumn = worksheet.getColumn(i + 1)

    curColumn.border = {
      top: {style: 'thin'},
      left: {style: 'thin'},
      bottom: {style: 'thin'},
      right: {style: 'thin'}
    }

    curColumn.font = {
      name: 'Calibri'
    }

    curColumn.alignment = {}
    // curColumn.alignment = {wrapText: true}
  })

  setRowHeaderStyle(worksheet.getRow(1))
}

function setColumnsTextWrap(worksheet, columns) {
  columns.forEach(col => {
    worksheet.getColumn(col).alignment.wrapText = true
  })
}

function addTopRow(worksheet, topRow, merge = 'A1:E1') {
  worksheet.spliceRows(1, 0, topRow)
  worksheet.mergeCells(merge)
  worksheet.getRow(1).height = 20
  worksheet.getRow(1).font.bold = false

  setRowHeaderStyle(worksheet.getRow(2))
}

function addSummary(worksheet, summary, emptyColsCount) {
  let summaryRow = []

  for (let i = 0; i < emptyColsCount; i++) {
    summaryRow.push('')
  }
  summaryRow.push('Итого:', summary)

  worksheet.addRow(summaryRow)
  worksheet.getRow(worksheet.lastRow._number).font = {
    bold: true,
    name: 'Calibri'
  }
}

function mergeCellsByKey(worksheet, rows, key, mergedColumns, ROWS_OFFSET) {
  let prevValue = null,
    rowStart = null,
    rowEnd = null,
    rowEndIndex = null,
    rowStartIndex = null,
    mergeStart = '',
    mergeEnd = ''

  rows.forEach((row, i) => {
    if ((row[key] === prevValue) && (i !== rows.length - 1)) {
      rowEnd = i
    }
    else {
      if (i === rows.length - 1) rowEnd = i

      if (rowEnd > rowStart) {
        mergedColumns.forEach(col => {
          rowStartIndex = (rowStart + ROWS_OFFSET).toString()
          rowEndIndex = (rowEnd + ROWS_OFFSET).toString()

          mergeStart = col + rowStartIndex
          mergeEnd = col + rowEndIndex

          let cellMergeStart = worksheet.getCell(mergeEnd)

          worksheet.mergeCells(mergeStart, mergeEnd)

          cellMergeStart.alignment.vertical = 'top'
          cellMergeStart.alignment.horizontal = 'center'
          //cellMergeStart.alignment.wrapText = true

        })

        rowEnd = null
      }

      rowStart = i
      prevValue = row[key]
    }
  })
}

function setRowsMediumBorderByColumnKey(worksheet, column, rowOffset) {
  let prevValue = '',
    curValue = '',
    row

  for (let i = rowOffset; i < worksheet.rowCount; i++) {
    row = worksheet.getRow(i)
    curValue = row.getCell(column).value

    if (prevValue !== curValue) {
      row.border = {
        top: {style: 'medium'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
      }

      prevValue = curValue
    }
  }
}

module.exports = {
  createWorksheet,
  setRowHeaderStyle,
  createBorderedColumns,
  addTopRow,
  addSummary,
  mergeCellsByKey,
  setColumnsTextWrap,
  setRowsMediumBorderByColumnKey
}