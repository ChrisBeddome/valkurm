import {execSync} from 'child_process'
import fs from 'fs'
import path from 'path'

const MIGRATIONS_DIR_PATH = new URL('../migrations/', import.meta.url)

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

const deleteGlobalConfig = () => {
  const filepath = new URL('../valkurmConfig.js', import.meta.url);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath)
  }
}

const restoreGlobalConfig = () => {
  const sourceFilepath = new URL('../valkurmConfig.js.backup', import.meta.url);
  const destFilepath = new URL('../valkurmConfig.js', import.meta.url);
  fs.copyFileSync(sourceFilepath, destFilepath)
}

const runCommand = command => {
  let output = {}, exitCode
  try {
    output.stdout = execSync(command).toString()
  } 
  catch (error) {
    output.stderr = error.stderr.toString()
    exitCode = error.status
  }
  return [output, exitCode]
}


export {
  runCommand,
  restoreGlobalConfig,
  deleteGlobalConfig,
  deleteMigrationsDirectory,
  getSchemaMigrationFiles,
  getDataMigrationFiles
}
