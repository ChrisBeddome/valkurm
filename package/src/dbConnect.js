import mariadb from 'mariadb'
import {getConfig} from './config.js'
import UserError from './userError.js'

const getDbConfig = () => {
  const globalConfig = getConfig()
  let dbConfig = {}
  const requiredConfigKeys = ['host', 'port', 'user', 'password', 'database']

  requiredConfigKeys.forEach(key => {
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
    conn = await mariadb.createConnection(getDbConfig())
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

