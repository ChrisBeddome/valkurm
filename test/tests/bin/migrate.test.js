import missingConfigExamples from '../shared_examples/missingConfigExamples.js'
import migrationExamples from '../shared_examples/migrationExamples.js'

describe('schema migrations', () => {
  missingConfigExamples('npm run valkurm migrate-schema')
  migrationExamples('schema')
})
describe('schema migrations', () => {
  missingConfigExamples('npm run valkurm migrate-data')
  migrationExamples('data')
})
