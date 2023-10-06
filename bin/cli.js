#!/usr/bin/env node

const command = process.argv[2] 
const args = process.argv.slice(3)

const executables = {
  'generate-schema-migration': '../src/generateSchemaMigration.js'
}

if (!command) {
  console.error('\nUsage: [command] [options]\n')
  console.error('Commands: ')
  for (const command of Object.keys(executables)) {
    console.error(`  ${command}`);
  }
  console.error('')
  process.exit(1)
}

if (executables.hasOwnProperty(command)) {
  const module = await import(executables[command]);
  module.default(args)
} else {
  console.error(`\nCommand '${command}' not recognized.\n`)
  process.exit(1)
}

