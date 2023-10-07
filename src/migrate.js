import fs from 'fs/promises'
import path from 'path'
import {transaction} from './dbConnect.js'
import {createDirIfNoExist} from './pathHelpers.js'

const setupMigrationTable = async (table, connection) => {
  const query =  `
    CREATE TABLE IF NOT EXISTS ${table} (
      name VARCHAR(255) NOT NULL,
      PRIMARY KEY (name)
    )
  `
  await connection.execute(query)
}

const getCompletedMigrations = async (table, connection) => {
  return await connection.execute(`SELECT name FROM ${table}`)
}

const getFilesForMigration = async (directory, table) => {
  const completedMigrationFileNames = (
    await transaction(getCompletedMigrations.bind(null, table))
  ).map(row => row.name)

  const allMigrationFileNames = (
    await fs.readdir(directory)
  ).filter(filename => filename.endsWith(".js"))
  
  return allMigrationFileNames
    .filter(filename => !completedMigrationFileNames.includes(filename))
}

const migrateOne = async (table, directory, filename, connection) => {
  try {
    const module = await import(path.join(directory, filename))
    await connection.execute(module.up())
    await connection.execute(`INSERT INTO ${table} (name) VALUES ('${filename}')`)
  } catch (e) {
    throw e
  }
}

const migrate = async (directory, table) => {
  try {
    await createDirIfNoExist(directory)
    await transaction(setupMigrationTable.bind(null, table))
    const filesToMigrate = await getFilesForMigration(directory, table)
    for (const filename of filesToMigrate) {
      await transaction(migrateOne.bind(null, table, directory, filename))
    }
  } catch(e) {
    throw e
  }
}

export default migrate
