import path from 'path'
import url from 'url'
import fs from 'fs/promises'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
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

export {__dirname, __approot, createDirIfNoExist}
