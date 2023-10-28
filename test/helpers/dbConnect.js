import mysql from 'mysql2/promise'

let dbConfig = {
  multipleStatements: true, 
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}

let conn

const getConn = async () => {
  if (!conn) {
    conn = await mysql.createConnection(dbConfig)
  }
  return conn
}

const release = async () => {
  if (conn) {
    await conn.end()
    conn = null
  }
}

export { getConn, release }


