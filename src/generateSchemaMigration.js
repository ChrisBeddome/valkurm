import generateMigration from './generateMigration.js'

const userInput = process.argv[2]
const migrationDirName = "schema"

await generateMigration(migrationDirName, userInput)
