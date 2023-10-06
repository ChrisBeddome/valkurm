import UserError from './userError.js'
import fs from 'fs/promises'
import path from 'path'
import {__approot} from './pathHelpers.js'

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

const createDirIfNoExist = directoryPath => {
  if (!fs.exists(directoryPath)) {
    fs.mkdir(directoryPath, { recursive: true });
  } 
}

const generateMigration = async (dirName, migrationName) => {
  if (!migrationName || migrationName.trim() === '') {
    throw new UserError('Please provide a valid file name.')
  }
  const migrationDir = path.join(__approot, `../migrations/${dirName}/`)
  await createDirIfNoExist(migrationDir)
  const fileName = generateFileName(migrationName)
  const filePath = path.join(migrationDir, fileName)
  const fileContent = generateFileContent()
  await fs.writeFile(filePath, fileContent)
}

export default generateMigration
