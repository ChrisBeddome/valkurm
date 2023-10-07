import migrate from '../migrate.js'
import {getConfig} from '../config.js'

const run = async options => {
  const path = getConfig().schemaMigrationPath
  const table = getConfig().schemaMigrationTable
  await migrate(path, table)
  return "Migration complete"
}

export {run}

