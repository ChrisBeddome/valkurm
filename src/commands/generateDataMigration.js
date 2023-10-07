import generateMigration from '../generateMigration.js'
import {getConfig} from '../config.js'

const run = async options => {
  const filepath = await generateMigration(getConfig().dataMigrationPath, options.name)
  return `Generated file: ${filepath}`
}

export {run}
