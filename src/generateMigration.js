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

const directoryExists = async directoryPath => {
  try {
    await fs.access(directoryPath, fs.constants.F_OK);
    return true
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false
    } else {
      throw err
    }
  }
}

const createDirIfNoExist = async directoryPath => {
  if (!(await directoryExists(directoryPath))) {
    await fs.mkdir(directoryPath, { recursive: true });
  } 
}

const generateMigration = async (dir, migrationName) => {
  if (!migrationName || migrationName.trim() === '') {
    throw new UserError('Please provide a valid file name.')
  }
  await createDirIfNoExist(dir)
  const fileName = generateFileName(migrationName)
  const filePath = path.join(dir, fileName)
  const fileContent = generateFileContent()
  await fs.writeFile(filePath, fileContent)
}

export default generateMigration
