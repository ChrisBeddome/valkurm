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
  tableContainsRecord,
  tableContainsColumn,
  cleanDatabase
} from '../../helpers/databaseHelpers.js'

describe('when command = migrate-schema', () => {
  const command = 'npm run valkurm migrate-schema'

  beforeAll(async () => {
    resetMigrationsDirectory()
  })

  missingConfigExamples(command)

  describe('when valid valkurmConfig.js exists', () => {
    beforeAll(async () => {
      restoreGlobalConfig()
    })

    it('should create schema_migrations table', async () => {
      expect (await tableExists('schema_migrations')).toBe(false)
      runCommand(command)
      expect (await tableExists('schema_migrations')).toBe(true)
    })

    describe('when schema_migrations directory empty', () => {
      beforeAll(() => {
        resetMigrationsDirectory()
      })
      it("schema_migrations table should be empty", async () => {
        runCommand(command)
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
        runCommand(command)
        expect(await tableIsEmpty('schema_migrations')).toBe(true)
      })
      it('should output message indicating JS error', () => {
        const [output, code] = runCommand(command)
        expect(output.stderr).toMatch(/contains \(javascript\) syntax errors/)
      })
    })

    describe('When schema_migrations contains single .js file with valid JS', () => {
      beforeAll(async () => await cleanDatabase())
      afterAll(async () => await cleanDatabase())

      describe('When nothing returned from up()', () => {
        beforeAll(() => {
          setupSchemaMigrationFiles('nothing_returned_from_up')
        })
        afterAll(() => {
          resetMigrationsDirectory()
        })
        it("schema_migrations table should be empty", async () => {
          runCommand(command)
          expect(await tableIsEmpty('schema_migrations')).toBe(true)
        })
        it('should output type error', () => {
          const [output, code] = runCommand(command)
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
          runCommand(command)
          expect(await tableIsEmpty('schema_migrations')).toBe(true)
        })
        it('should output SQL syntax error', () => {
          const [output, code] = runCommand(command)
          expect(output.stderr).toMatch(/You have an error in your SQL syntax/)
        })
      })

      describe('When valid SQL returned from up()', () => {
        describe('when migrations dir contains create-table migration', () => {
          let output, code
          beforeAll(() => {
            setupSchemaMigrationFiles('single_create_test_table')
            // No idea why this doesn't work. Putting it before setupSchemaMigration works ????!?!??
            // [output, code] = runCommand(command)
            const res = runCommand(command)
            output = res[0]
            code = res[1]
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
            beforeAll(() => {
              setupSchemaMigrationFiles('single_create_test_table')
              const res = runCommand(command)
              output = res[0]
              code = res[1]
            })
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

    describe('When schema_migrations contains multiple .js files', () => {
      beforeAll(async () => await cleanDatabase())
      afterAll(async () => await cleanDatabase())

      describe('When first valid, second invalid', () => {
        let output, code
        beforeAll(async () => {
          await cleanDatabase()
          setupSchemaMigrationFiles('first_valid_second_invalid')
          const res = runCommand(command)
          output = res[0]
          code = res[1]
        })
        afterAll(async () => {
          await cleanDatabase()
          resetMigrationsDirectory()
        })
        it(`schema_migrations table should contain 1 record`, async () => {
          expect(await tableRecordCount('schema_migrations')).toBe(1)
        })
        it(`schema_migrations table should contain expected record`, async () => {
          expect(await tableContainsRecord('schema_migrations', {name: '01_create_test_table.js'})).toBe(true)
        })
        it('should create test1 table', async () => {
          expect(await tableExists('test1')).toBe(true)
        })
        it('should output type error', () => {
          expect(output.stderr).toMatch(/You have an error in your SQL syntax/)
        })

        describe('when run a second time', () => {
          beforeAll(() => {
            const res = runCommand(command)
            output = res[0]
            code = res[1]
          })
          it('should output type error', () => {
            expect(output.stderr).toMatch(/You have an error in your SQL syntax/)
          })
          it(`schema_migrations table should (still) contain 1 record`, async () => {
            expect(await tableRecordCount('schema_migrations')).toBe(1)
          })
        })

      })

      describe('When both valid', () => {
        let output, code
        beforeAll(async () => {
          await cleanDatabase()
          setupSchemaMigrationFiles('two_valid')
          const res = runCommand(command)
          output = res[0]
          code = res[1]
        })
        afterAll(async () => {
          await cleanDatabase()
          resetMigrationsDirectory()
        })
        it(`schema_migrations table should contain 2 records`, async () => {
          expect(await tableRecordCount('schema_migrations')).toBe(2)
        })
        it(`schema_migrations table should contain expected records`, async () => {
          expect(await tableContainsRecord('schema_migrations', {name: '01_create_test_table.js'})).toBe(true)
          expect(await tableContainsRecord('schema_migrations', {name: '02_add_count_to_test_table.js'})).toBe(true)
        })
        it('should create test1 table', async () => {
          expect(await tableExists('test1')).toBe(true)
        })
        it('should add count column to test1 table', async () => {
          expect(await tableContainsColumn('test1', 'count')).toBe(true)
        })
        it('should output migration count of 2', () => {
          expect(output.stdout).toMatch(/2 migrations run/)
        })

        describe('when run a second time', () => {
          beforeAll(() => {
            const res = runCommand(command)
            output = res[0]
            code = res[1]
          })
          it('should output migration count of 0', () => {
            expect(output.stdout).toMatch(/0 migrations run/)
          })
          it(`schema_migrations table should (still) contain 2 records`, async () => {
            expect(await tableRecordCount('schema_migrations')).toBe(2)
          })
        })

      })

    })
  })
})
