import fs from 'fs/promises'
import path from 'path'
import {transaction} from './dbConnect.js'
import {createDirIfNoExist} from './pathHelpers.js'
import UserError from './userError.js'

const setupMigrationTable = async table => {
  const query =  `
    CREATE TABLE IF NOT EXISTS ${table} (
      name VARCHAR(255) NOT NULL,
      PRIMARY KEY (name)
    )
  `
  
  await transaction(async runQuery => {
    await runQuery(query)
  })
}

const getCompletedMigrations = async table => {
  const rows = await transaction(async runQuery => {
    return await runQuery(`SELECT name FROM ${table}`)
  })
  return rows.map(row => row.name)
}

const getAllMigrationFileNames = async directory => {
  const files = await fs.readdir(directory)
  return files.filter(filename => filename.endsWith(".js"))
}

const getFilesForMigration = async (directory, table) => {
  const completedMigrationFileNames = await getCompletedMigrations(table)
  const allMigrationFileNames = await getAllMigrationFileNames(directory)
  return allMigrationFileNames
    .filter(filename => !completedMigrationFileNames.includes(filename))
}

const getMigrationQueryFromFile = async filepath => {
  let query
  try {
    const module = await import(filepath)
    query = module.up()
  } catch (e) {
    throw new UserError(`It is likely that the file ${filepath} contains (javascript) syntax errors`)
  }
  if (!query || typeof query !== 'string') throw new UserError(`Must return SQL string from ${filepath} up()`)
  return query
}

const migrateOne = async (table, filename, query) => {
  await transaction(async runQuery => {
    try {
      await runQuery(query)
    } catch(e) {
      e.sqlOrigin = filename
      throw e
    }
    await runQuery(`INSERT INTO ${table} (name) VALUES ('${filename}')`)
  })
}

const migrate = async (directory, table) => {
  await createDirIfNoExist(directory)
  await setupMigrationTable(table)
  const filesToMigrate = await getFilesForMigration(directory, table)
  let successCount = 0
  for (const filename of filesToMigrate) {
    const migrationQuery = await getMigrationQueryFromFile(path.join(directory, filename))
    await migrateOne(table, filename, migrationQuery)
    successCount++
  }
  return successCount
}

export default migrate
