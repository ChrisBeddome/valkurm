import fs from 'fs'
import path from 'path'

const MIGRATIONS_DIR_PATH = new URL('../migrations/', import.meta.url)
const MIGRATION_EXAMPLES_DIR_PATH = new URL('../migration_examples/', import.meta.url)

const copyFiles = (sourceDir, targetDir) => {
  const files = fs.readdirSync(sourceDir)
  files.forEach(file => {
    const sourceFilePath = new URL(file, sourceDir)
    const targetFilePath = new URL(file, targetDir)
    fs.copyFileSync(sourceFilePath, targetFilePath)
  })
}

const createDirIfNoExist = directoryPath => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true })
  }
}

const getMigrationFiles = subdir => {
  const dir = new URL(subdir, MIGRATIONS_DIR_PATH)
  let files = []
  if (fs.existsSync(dir)) {
    files = fs.readdirSync(dir)
  }
  return files
}

const getSchemaMigrationFiles = () => {
  return getMigrationFiles('schema')
}

const getDataMigrationFiles = () => {
  return getMigrationFiles('data')
}

const deleteMigrationsDirectory = () => {
  if (fs.existsSync(MIGRATIONS_DIR_PATH)) {
    fs.rmSync(MIGRATIONS_DIR_PATH, {recursive: true})
  }
}

const resetMigrationsDirectory = () => {
  deleteMigrationsDirectory()
  createDirIfNoExist(new URL('./schema', MIGRATIONS_DIR_PATH))
  createDirIfNoExist(new URL('./data', MIGRATIONS_DIR_PATH))
}

const setupMigrationFiles = (type, exampleGroup) => {
  resetMigrationsDirectory()
  const exampleDir = new URL(`./${exampleGroup}/`, MIGRATION_EXAMPLES_DIR_PATH)
  const targetDir = new URL(`./${type}/`, MIGRATIONS_DIR_PATH) 
  copyFiles(exampleDir, targetDir)
}

const setupSchemaMigrationFiles = exampleGroup => {
  setupMigrationFiles('schema', exampleGroup)
}

const setupDataMigrationFiles = exampleGroup => {
  setupMigrationFiles('data', exampleGroup)
}

const deleteGlobalConfig = () => {
  const filepath = new URL('../valkurmConfig.js', import.meta.url)
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath)
  }
}

const restoreGlobalConfig = () => {
  const sourceFilepath = new URL('../valkurmConfig.js.backup', import.meta.url)
  const destFilepath = new URL('../valkurmConfig.js', import.meta.url)
  fs.copyFileSync(sourceFilepath, destFilepath)
}

export {
  restoreGlobalConfig,
  deleteGlobalConfig,
  deleteMigrationsDirectory,
  resetMigrationsDirectory,
  setupSchemaMigrationFiles,
  setupDataMigrationFiles,
  getSchemaMigrationFiles,
  getDataMigrationFiles
}
