#!/usr/bin/env node

import UserError from '../src/userError.js'

const COMMANDS = {
  'generate-schema-migration': {
    path: '../src/commands/generateSchemaMigration.js',
    args: ['name']
  }
}

const getFormattedOptions = (command, argsFromUser) => {
  return command.args.reduce((acc, curr) => {
    return {...acc, [curr]: argsFromUser[Object.keys(acc).length] }
  }, {})
}

const run = async (command, argsFromUser) => {
  try {
    const module = await import(command.path);
    module.run(getFormattedOptions(command, argsFromUser))
  } catch(e) {
    if (e instanceof UserError) {
      console.error(e.message);
    } else {
      console.error(e)
    }
    process.exit(1)
  }
}


const commandNames = Object.keys(COMMANDS)
const commandNameFromUser = process.argv[2] 
const argsFromUser = process.argv.slice(3)

if (!commandNameFromUser) {
  console.error('\nUsage: [command] [options]\n')
  console.error('Commands: ')
  for (const commandName of commandNames) {
    const args = COMMANDS[commandName].args
    console.error(`  ${commandName} ${args.map(arg => '<' + arg + '>' + ' ')}`);
  }
  console.error('')
  process.exit(1)
}

if (commandNames.includes(commandNameFromUser)) {
  run(COMMANDS[commandNameFromUser], argsFromUser)
} else {
  console.error(`\nCommand '${commandNameFromUser}' not recognized.\n`)
  process.exit(1)
}

