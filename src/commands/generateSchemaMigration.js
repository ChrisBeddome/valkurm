import generateMigration from '../generateMigration.js'

const run = async options => {
  await generateMigration('schema', options.name)
}

export {run}

