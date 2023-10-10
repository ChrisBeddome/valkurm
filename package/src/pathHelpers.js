import path from 'path'
import fs from 'fs/promises'

const __approot = process.cwd()

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

export { __approot, createDirIfNoExist}
