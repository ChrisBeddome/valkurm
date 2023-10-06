import generateMigration from './generateMigration.js'

const userInput = process.argv[2]
const migrationDirName = "data"

await generateMigration(migrationDirName, userInput)
