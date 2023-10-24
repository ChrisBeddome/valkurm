import {deleteMigrationsDirectory} from './tests/helpers.js'
import cleanDatabase from './cleanDatabase.js'

const teardown = () => {
  deleteMigrationsDirectory()
  cleanDatabase()
}

export default teardown
