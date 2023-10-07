import migrate from '../migrate.js'
import {getConfig} from '../config.js'

const run = async options => {
  const path = getConfig().dataMigrationPath
  const table = getConfig().dataMigrationTable
  await migrate(path, table)
}

export {run}
