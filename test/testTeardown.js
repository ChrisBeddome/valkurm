import {deleteMigrationsDirectory} from './tests/fileHelpers.js'
import {cleanDatabase} from './tests/databaseHelpers.js'

const teardown = () => {
  deleteMigrationsDirectory()
  cleanDatabase()
}

export default teardown
