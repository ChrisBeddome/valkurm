import generateMigration from '../generateMigration.js'

const run = async options => {
  await generateMigration('data', options.name)
}

export {run}
