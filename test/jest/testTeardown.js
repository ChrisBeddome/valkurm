import {deleteMigrationsDirectory, deleteGlobalConfig} from '../helpers/fileHelpers.js'
import {cleanDatabase} from '../helpers/databaseHelpers.js'

const teardown = () => {
  deleteMigrationsDirectory()
  deleteGlobalConfig()
  cleanDatabase()
}

export default teardown
