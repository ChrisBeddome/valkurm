import generateMigration from '../generateMigration.js'
import {getConfig} from '../config.js'

const run = async options => {
  const filepath = await generateMigration(getConfig().schemaMigrationPath, options.name)
  return `Generated file: ${filepath}`
}

export {run}

