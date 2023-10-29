import generateMigration from '../generateMigration.js'
import {getConfig} from '../config.js'

const run = async options => {
  const config = await getConfig()
  const filepath = await generateMigration(config.schemaMigrationPath, options.name)
  return `Generated file: ${filepath}`
}

export {run}

