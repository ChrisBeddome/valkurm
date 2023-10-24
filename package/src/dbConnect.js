import mysql from 'mysql2/promise'
import {getConfig} from './config.js'
import UserError from './userError.js'

const getDbConfig = () => {
  let dbConfig = {
    multipleStatements: true
  }

  const globalConfig = getConfig()
  const requiredUserConfigKeys = ['host', 'port', 'user', 'password', 'database']

  requiredUserConfigKeys.forEach(key => {
    if (!globalConfig[key]) {
      throw new UserError(`missing config option: ${key}, please add this to your valkurmConfig.js file`)
    } else {
      dbConfig[key] = globalConfig[key]
    }
  })

  return dbConfig
}

let conn

const getConn = async () => {
  if (!conn) {
    conn = await mysql.createConnection(getDbConfig())
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
  let result
  try {
    await connection.beginTransaction()
    result = await fn(async query => {
      const [rows, fields] = await connection.query(query)
      return rows
    })
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    await release()
  }
  return result
}

export { transaction }

