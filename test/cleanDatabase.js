import { getConn, release } from './dbConnect.js'

const getTables = async () => {
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

const dropTables = async tableNames => {
  const connection = await getConn()
  tableNames.forEach(async table => {
    const dropTableSQL = `DROP TABLE ${table};`
    await connection.query(dropTableSQL)
  })
  await release()
}

const cleanDatabase = async () => {
  const tables = await getTables() 
  await dropTables(tables.map(t => t.table_name))
}

export default cleanDatabase
