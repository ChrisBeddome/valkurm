#!/usr/bin/env node

import UserError from '../src/userError.js'

const EXECUTABLES = {
  'generate-schema-migration': '../src/generateSchemaMigration.js'
}

const command = process.argv[2] 
const commandArgs = process.argv.slice(3)

const run = async command => {
  try {
    const module = await import(EXECUTABLES[command]);
    module.default(...commandArgs)
  } catch(e) {
    if (e instanceof UserError) {
      console.error(e.message);
    } else {
      console.error(e)
    }
    proccess.exit(1)
  }
}

if (!command) {
  console.error('\nUsage: [command] [options]\n')
  console.error('Commands: ')
  for (const command of Object.keys(EXECUTABLES)) {
    console.error(`  ${command}`);
  }
  console.error('')
  process.exit(1)
}

if (EXECUTABLES.hasOwnProperty(command)) {
  run(command)
} else {
  console.error(`\nCommand '${command}' not recognized.\n`)
  process.exit(1)
}

