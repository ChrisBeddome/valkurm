import missingConfigExamples from '../shared_examples/missingConfigExamples.js'
import generateMigrationExamples from '../shared_examples/generateMigrationExamples.js'

import {
  getSchemaMigrationFiles,
  getDataMigrationFiles
} from '../../helpers/fileHelpers.js'

describe('schema migration generation', () => {
  missingConfigExamples('npm run valkurm generate-schema-migration')
  generateMigrationExamples('npm run valkurm generate-schema-migration', getSchemaMigrationFiles)
})
describe('data migration generation', () => {
  missingConfigExamples('npm run valkurm generate-data-migration')
  generateMigrationExamples('npm run valkurm generate-data-migration', getDataMigrationFiles)
})
