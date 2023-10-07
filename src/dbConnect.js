import mariadb from 'mariadb'
import {getConfig} from './config.js'
import UserError from './userError.js'

const dbConfig = ['host', 'port', 'user', 'password', 'database'].reduce((acc, option) => {
  if (!getConfig()[option]) {
    throw new UserError(`missing config option: ${option}`)
  }
  acc[option] = getConfig()[option] 
  return acc
}, {})

let conn

const getConn = async () => {
  if (!conn) {
    conn = await mariadb.createConnection(dbConfig)
  }
  return conn
}

const release = async () => {
  if (conn) {
    await conn.end()
    conn = null
  }
}

const transaction = async fn => {
  const connection = await getConn()
  try {
    await connection.beginTransaction()
    const val = await fn(connection)
    await connection.commit()
    return val
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    await release()
  }
}

export { transaction }

