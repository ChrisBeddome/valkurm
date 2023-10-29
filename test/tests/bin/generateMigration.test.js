import missingConfigExamples from '../shared_examples/missingConfigExamples.js'
import generateMigrationExamples from '../shared_examples/generateMigrationExamples.js'

import {
  getSchemaMigrationFiles,
  getDataMigrationFiles
} from '../../helpers/fileHelpers.js'

describe('when command = generate-schema-migration', () => {
  missingConfigExamples('npm run valkurm generate-schema-migration')
  generateMigrationExamples('npm run valkurm generate-schema-migration', getSchemaMigrationFiles)
})
describe('when command = generate-data-migration', () => {
  missingConfigExamples('npm run valkurm generate-data-migration')
  generateMigrationExamples('npm run valkurm generate-data-migration', getDataMigrationFiles)
})
