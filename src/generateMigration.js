import UserError from './userError.js'
import fs from 'fs/promises'
import path from 'path'
import {__approot, createDirIfNoExist} from './pathHelpers.js'

const getDateString = () => new Date().toISOString().replace(/[-T:.]/g, '')

const generateFileName = migrationName => `${getDateString()}_${migrationName}.js`

const generateFileContent = () => {
  return `export const up = () => {
  // return SQL query for migration up
}

export const down = () => {
  // return SQL query for migration down
}
`
}

const validateMigrationName = migrationName => {
  if (!migrationName || migrationName.trim() === '') {
    throw new UserError('Please provide a valid file name.')
  }
}

const generateMigration = async (dir, migrationName) => {
  await validateMigrationName(migrationName)
  await createDirIfNoExist(dir)
  const fileName = generateFileName(migrationName)
  const filePath = path.join(dir, fileName)
  const fileContent = generateFileContent()
  await fs.writeFile(filePath, fileContent)
  return filePath
}

export default generateMigration
