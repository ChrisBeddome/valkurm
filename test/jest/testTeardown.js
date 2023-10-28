import {deleteMigrationsDirectory} from '../helpers/fileHelpers.js'
import {cleanDatabase} from '../helpers/databaseHelpers.js'

const teardown = () => {
  deleteMigrationsDirectory()
  cleanDatabase()
}

export default teardown
