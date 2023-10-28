import migrate from '../migrate.js'
import {getConfig} from '../config.js'

const run = async options => {
  const path = getConfig().dataMigrationPath
  const table = getConfig().dataMigrationTable
  const count = await migrate(path, table)
  return `Migration complete. ${count} migration${count === 1 ? '' : 's'} run.`
}

export {run}
