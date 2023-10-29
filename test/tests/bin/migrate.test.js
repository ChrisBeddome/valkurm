import { runCommand } from '../../helpers/runHelpers.js'
import missingConfigExamples from '../shared_examples/missingConfigExamples.js'

import {
  restoreGlobalConfig,
  resetMigrationsDirectory,
  setupSchemaMigrationFiles
} from '../../helpers/fileHelpers.js'

import {
  tableExists,
  tableIsEmpty,
  tableRecordCount,
  tableContainsRecord
} from '../../helpers/databaseHelpers.js'

describe('when command = migrate-schema', () => {
  const command = 'npm run valkurm migrate-schema'

  missingConfigExamples(command)

  let code, output
  beforeEach(() => {
    [output, code] = runCommand(command)
  })

  describe('when valid valkurmConfig.js exists', () => {
    beforeAll(async () => {
      restoreGlobalConfig()
    })

    it('should create schema_migrations table', async () => {
      expect (await tableExists('schema_migrations')).toBe(true)
    })

    describe('when schema_migrations directory empty', () => {
      beforeAll(() => {
        resetMigrationsDirectory()
      })
      it("schema_migrations table should be empty", async () => {
        expect(await tableIsEmpty('schema_migrations')).toBe(true)
      })
    })

    describe('When schema_migrations contains single .js file with invalid (JS) syntax', () => {
      beforeAll(() => {
        setupSchemaMigrationFiles('invalid_js_syntax')
      })
      afterAll(() => {
        resetMigrationsDirectory()
      })
      it("schema_migrations table should be empty", async () => {
        expect(await tableIsEmpty('schema_migrations')).toBe(true)
      })
      it('should output message indicating JS error', () => {
        expect(output.stderr).toMatch(/contains \(javascript\) syntax errors/)
      })
    })

    describe('When schema_migrations contains single .js file with valid JS', () => {
      describe('When nothing returned from up()', () => {
        beforeAll(() => {
          setupSchemaMigrationFiles('nothing_returned_from_up')
        })
        afterAll(() => {
          resetMigrationsDirectory()
        })
        it("schema_migrations table should be empty", async () => {
          expect(await tableIsEmpty('schema_migrations')).toBe(true)
        })
        it('should output type error', () => {
          expect(output.stderr).toMatch(/Must return SQL string/)
        })
      })

      describe('When invalid SQL returned from up()', () => {
        beforeAll(() => {
          setupSchemaMigrationFiles('invalid_sql_returned_from_up')
        })
        afterAll(() => {
          resetMigrationsDirectory()
        })
        it("schema_migrations table should be empty", async () => {
          expect(await tableIsEmpty('schema_migrations')).toBe(true)
        })
        it('should output SQL syntax error', () => {
          expect(output.stderr).toMatch(/You have an error in your SQL syntax/)
        })
      })

      describe('When valid SQL returned from up()', () => {
        describe('when migrations dir contains create-table migration', () => {
          beforeAll(() => {
            setupSchemaMigrationFiles('single_create_test_table')
          })
          afterAll(() => {
            resetMigrationsDirectory()
          })
          it(`schema_migrations table should contain 1 record`, async () => {
            expect(await tableRecordCount('schema_migrations')).toBe(1)
          })
          it(`schema_migrations table should contain expected record`, async () => {
            expect(await tableContainsRecord('schema_migrations', {name: '01_create_test_table.js'})).toBe(true)
          })
          it('should create test_table table', async () => {
            expect(await tableExists('test_table')).toBe(true)
          })
          it('should output message indicating successful migration', () => {
            expect(output.stdout).toMatch(/Migration complete/)
          })
          it('should output migration count of 1', () => {
            expect(output.stdout).toMatch(/1 migration run/)
          })

          describe('when run a second time', () => {
            it('should output message indicating successful migration', () => {
              expect(output.stdout).toMatch(/Migration complete/)
            })
            it('should output migration count of 0', () => {
              expect(output.stdout).toMatch(/0 migrations run/)
            })
            it(`schema_migrations table should (still) contain 1 record`, async () => {
              expect(await tableRecordCount('schema_migrations')).toBe(1)
            })

          })
        })
      })
    })
  })
})
