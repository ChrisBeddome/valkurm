import mariadb from 'mariadb'
import config from './config.js'

const dbConfig = ['host', 'port', 'user', 'password', 'database'].reduce((option, acc) => {
  if (!config[option]) {
    throw new Error(`missing config option: ${option}`)
  }
  acc[option] = config[option] 
}, {})

let conn

const getConn = async () => {
  if (!conn) {
    conn = await mariadb.createConnection(dbConfig)
  }
  return conn
}

const release = () => {
  if (conn) {
    conn.end()
    conn = null
  }
}

const transaction = async fn => {
  const connection = await getConn()
  try {
    await connection.beginTransaction()
    await fn(connection)
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    release()
  }
}

export { transaction }

