#!/usr/bin/env node

import UserError from '../src/userError.js'

const COMMANDS = Object.freeze({
  'generate-schema-migration': {
    path: '../src/commands/generateSchemaMigration.js',
    args: ['name']
  },
  'generate-data-migration': {
    path: '../src/commands/generateDataMigration.js',
    args: ['name']
  },
  'migrate-schema': {
    path: '../src/commands/migrateSchema.js'
  },
  'migrate-data': {
    path: '../src/commands/migrateData.js'
  }
})

// takes user input ie: valkurm genereate-schema-migration migration1
// and runs it against the COMMAND args to tranform into:
// { name: migration1 }
const getFormattedOptions = (command, argsFromUser) => {
  if (!command.args) {
    return {}
  }
  return command.args.reduce((acc, currentArg) => {
    return {...acc, [currentArg]: argsFromUser[Object.keys(acc).length] }
  }, {})
}

const runCommand = async (command, argsFromUser) => {
  const module = await import(command.path)
  await module.run(getFormattedOptions(command, argsFromUser))
}

const handleError = error => {
  if (error instanceof UserError) {
    console.error(error.message)
  } else {
    console.error(error)
  }
  process.exit(1)
}

const showUsage = () => {
  console.error('\nUsage: [command] [options]\n')
  console.error('Commands: ')
  for (const commandName of Object.keys(COMMANDS)) {
    const args = COMMANDS[commandName].args || []
    console.error(`  ${commandName} ${args.map(arg => '<' + arg + '>' + ' ')}`)
  }
  console.error('')
  process.exit(1)
}

const main = async () => {
  const commandNameFromUser = process.argv[2] 

  if (!commandNameFromUser) {
    showUsage()
  }

  const commandNames = Object.keys(COMMANDS)
  if (commandNames.includes(commandNameFromUser)) {
    try {
      const argsFromUser = process.argv.slice(3)
      await runCommand(COMMANDS[commandNameFromUser], argsFromUser)
    } catch(error) {
      handleError(error)
    }
  } else {
    console.error(`\nCommand '${commandNameFromUser}' not recognized.\n`)
    process.exit(1)
  }
}

main()
