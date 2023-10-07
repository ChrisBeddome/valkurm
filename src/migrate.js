import fs from 'fs/promises'
import path from 'path'
import {transaction} from './dbConnect.js'
import {createDirIfNoExist} from './pathHelpers.js'

const setupMigrationTable = async table => {
  const query =  `
    CREATE TABLE IF NOT EXISTS ${table} (
      name VARCHAR(255) NOT NULL,
      PRIMARY KEY (name)
    )
  `
  
  await transaction(connection => {
    connection.execute(query)
  })
}

const getCompletedMigrations = async table => {
  const rows =  await transaction(connection => {
    connection.execute(`SELECT name FROM ${table}`)
  })
  return rows.map(row => row.name)
}

const getAllMigrationFileNames = async directory => {
    return await (fs.readdir(directory))
      .filter(filename => filename.endsWith(".js"))
}

const getFilesForMigration = async (directory, table) => {
  const completedMigrationFileNames = await getCompletedMigrations(table)
  const allMigrationFileNames = await getAllMigrationFileNames(directory)
  return allMigrationFileNames
    .filter(filename => !completedMigrationFileNames.includes(filename))
}

const getMigrationQueryFromFile = async filepath => {
  const module = await import(filepath)
  return module.up()
}

const migrateOne = async (table, filename, query) => {
  transaction(connection => {
    await connection.execute(query)
    await connection.execute(`INSERT INTO ${table} (name) VALUES ('${filename}')`)
  })
}

const migrate = async (directory, table) => {
  await createDirIfNoExist(directory)
  await setupMigrationTable(table)
  const filesToMigrate = await getFilesForMigration(directory, table)
  for (const filename of filesToMigrate) {
    const migrationQuery = await getMigrationQueryFromFile(path.join(directory, filename))
    await migrateOne(table, filename, migrationQuery)
  }
}

export default migrate