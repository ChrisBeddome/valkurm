import { getConn, release } from './dbConnect.js'

const getAllTables = async () => {
  const getTablesSQL = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = '${process.env.DB_NAME}';
  `
  const connection = await getConn()
  const [rows, fields] = await connection.query(getTablesSQL)
  await release()
  return rows
}

const tableExists = async tableName => {
  const tables = await getAllTables()
  const tableNames = tables.map(table => table.table_name)
  return tableNames.includes(tableName)
}

const tableIsEmpty = async tableName => {
  return (await tableRecordCount(tableName) == 0)
}

const tableRecordCount = async tableName => {
  const connection = await getConn()
  const SQL = `SELECT count(*) as count FROM ${tableName};`
  const [rows, fields] = await connection.query(SQL)
  await release()
  return rows[0].count
}

const tableContainsRecord = async (tableName, expectedValues) => {
  const connection = await getConn()
  let SQL = `SELECT * FROM ${tableName}`

  Object.entries(expectedValues).forEach(([key, value], index) => {
    const keyword = index === 0 ? "WHERE" : "AND"
    if (typeof value == 'string') value = `\'${value}\'`
    SQL += ` ${keyword} ${key} = ${value}`
  })

  SQL += ";"

  const [rows, fields] = await connection.query(SQL)
  await release()
  return rows.length > 0
}

const dropTables = async tableNames => {
  const connection = await getConn()
  tableNames.forEach(async table => {
    const dropTableSQL = `DROP TABLE ${table};`
    await connection.query(dropTableSQL)
  })
  await release()
}

const cleanDatabase = async () => {
  const tables = await getAllTables() 
  await dropTables(tables.map(t => t.table_name))
}

export {
  tableExists,
  tableIsEmpty,
  tableRecordCount,
  tableContainsRecord,
  cleanDatabase
}
