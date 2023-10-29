import migrate from '../migrate.js'
import {getConfig} from '../config.js'

const run = async options => {
  const config = await getConfig()
  const path = config.schemaMigrationPath
  const table = config.schemaMigrationTable
  const count = await migrate(path, table)
  return `Migration complete. ${count} migration${count === 1 ? '' : 's'} run.`
}

export {run}

