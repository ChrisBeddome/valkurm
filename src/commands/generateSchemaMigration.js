import generateMigration from '../generateMigration.js'
import {getConfig} from '../config.js'

const run = async options => {
  await generateMigration(getConfig().schemaMigrationPath, options.name)
}

export {run}

