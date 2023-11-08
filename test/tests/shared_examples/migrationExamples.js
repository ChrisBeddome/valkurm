import { runCommand } from '../../helpers/runHelpers.js'

import {
  restoreGlobalConfig,
  resetMigrationsDirectory,
  setupSchemaMigrationFiles,
  setupDataMigrationFiles,
} from '../../helpers/fileHelpers.js'

import {
  tableExists,
  tableIsEmpty,
  tableRecordCount,
  tableContainsRecord,
  tableContainsColumn,
  cleanDatabase
} from '../../helpers/databaseHelpers.js'

export default type => {
  const command = `npm run valkurm migrate-${type}`
  const migrationsTable = `${type}_migrations`
  const migrationsDirectory = `${type}_migrations`
  const setupFiles = type === 'schema' ? setupSchemaMigrationFiles : setupDataMigrationFiles

  describe(`when command = ${command}`, () => {

    beforeAll(async () => {
      resetMigrationsDirectory()
    })

    describe('when valid valkurmConfig.js exists', () => {
      beforeAll(async () => {
        restoreGlobalConfig()
      })

      it(`should create ${migrationsTable} table`, async () => {
        expect (await tableExists(migrationsTable)).toBe(false)
        runCommand(command)
        expect (await tableExists(migrationsTable)).toBe(true)
      })

      describe(`when ${migrationsDirectory} directory empty`, () => {
        beforeAll(() => {
          resetMigrationsDirectory()
        })
        it(`${migrationsTable} table should be empty`, async () => {
          runCommand(command)
          expect(await tableIsEmpty(migrationsTable)).toBe(true)
        })
      })

      describe(`When ${migrationsDirectory} contains single .js file with invalid (JS) syntax`, () => {
        beforeAll(() => {
          setupFiles('invalid_js_syntax')
        })
        afterAll(() => {
          resetMigrationsDirectory()
        })
        it(`${migrationsTable} table should be empty`, async () => {
          runCommand(command)
          expect(await tableIsEmpty(migrationsTable)).toBe(true)
        })
        it('should output message indicating JS error', () => {
          const [output, code] = runCommand(command)
          expect(output.stderr).toMatch(/contains \(javascript\) syntax errors/)
        })
      })

      describe(`When ${migrationsDirectory} contains single .js file with valid JS`, () => {
        beforeAll(async () => await cleanDatabase())
        afterAll(async () => await cleanDatabase())

        describe('When nothing returned from up()', () => {
          beforeAll(() => {
            setupFiles('nothing_returned_from_up')
          })
          afterAll(() => {
            resetMigrationsDirectory()
          })
          it(`${migrationsTable} table should be empty`, async () => {
            runCommand(command)
            expect(await tableIsEmpty(migrationsTable)).toBe(true)
          })
          it('should output type error', () => {
            const [output, code] = runCommand(command)
            expect(output.stderr).toMatch(/Must return SQL string/)
          })
        })

        describe('When invalid SQL returned from up()', () => {
          beforeAll(() => {
            setupFiles('invalid_sql_returned_from_up')
          })
          afterAll(() => {
            resetMigrationsDirectory()
          })
          it(`${migrationsTable} table should be empty`, async () => {
            runCommand(command)
            expect(await tableIsEmpty(migrationsTable)).toBe(true)
          })
          it('should output SQL syntax error', () => {
            const [output, code] = runCommand(command)
            expect(output.stderr).toMatch(/You have an error in your SQL syntax/)
          })
        })

        describe('When valid SQL returned from up()', () => {
          describe('when migrations dir contains create-table migration', () => {
            let output, code
            beforeAll(async () => {
              await cleanDatabase()
              setupFiles('single_create_test_table')
              // No idea why this doesn't work. Putting it before setupFiles works ????!?!??
              // [output, code] = runCommand(command)
              const res = runCommand(command)
              output = res[0]
              code = res[1]
            })
            afterAll(async () => {
              await cleanDatabase()
              resetMigrationsDirectory()
            })
            it(`${migrationsTable} table should contain 1 record`, async () => {
              expect(await tableRecordCount(migrationsTable)).toBe(1)
            })
            it(`${migrationsTable} table should contain expected record`, async () => {
              expect(await tableContainsRecord(migrationsTable, {name: '01_create_test_table.js'})).toBe(true)
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
                setupFiles('single_create_test_table')
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
              it(`${migrationsTable} table should (still) contain 1 record`, async () => {
                expect(await tableRecordCount(migrationsTable)).toBe(1)
              })
            })

          })

          describe('when multiple SQL statements in same migration', () => {
            let output, code
            beforeAll(async () => {
              await cleanDatabase()
              setupFiles('multiple_statements')
              const res = runCommand(command)
              output = res[0]
              code = res[1]
            })
            afterAll(async () => {
              await cleanDatabase()
              resetMigrationsDirectory()
            })
            it(`${migrationsTable} table should contain 1 record`, async () => {
              expect(await tableRecordCount(migrationsTable)).toBe(1)
            })
            it(`${migrationsTable} table should contain expected record`, async () => {
              expect(await tableContainsRecord(migrationsTable, {name: '01_multiple_statements.js'})).toBe(true)
            })
            it('should create test_first table', async () => {
              expect(await tableExists('test_first')).toBe(true)
            })
            it('should create test_second table', async () => {
              expect(await tableExists('test_second')).toBe(true)
            })
            it('should output message indicating successful migration', () => {
              expect(output.stdout).toMatch(/Migration complete/)
            })
            it('should output migration count of 1', () => {
              expect(output.stdout).toMatch(/1 migration run/)
            })

            describe('when run a second time', () => {
              beforeAll(() => {
                setupFiles('multiple_statements')
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
              it(`${migrationsTable} table should (still) contain 1 record`, async () => {
                expect(await tableRecordCount(migrationsTable)).toBe(1)
              })
            })

          })

        })
      })

      describe(`${migrationsDirectory} contains multiple .js files`, () => {
        beforeAll(async () => await cleanDatabase())
        afterAll(async () => await cleanDatabase())

        describe('When first valid, second invalid', () => {
          let output, code
          beforeAll(async () => {
            await cleanDatabase()
            setupFiles('first_valid_second_invalid')
            const res = runCommand(command)
            output = res[0]
            code = res[1]
          })
          afterAll(async () => {
            await cleanDatabase()
            resetMigrationsDirectory()
          })
          it(`${migrationsTable} table should contain 1 record`, async () => {
            expect(await tableRecordCount(migrationsTable)).toBe(1)
          })
          it(`${migrationsTable} table should contain expected record`, async () => {
            expect(await tableContainsRecord(migrationsTable, {name: '01_create_test_table.js'})).toBe(true)
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
            it(`${migrationsTable} table should (still) contain 1 record`, async () => {
              expect(await tableRecordCount(migrationsTable)).toBe(1)
            })
          })
        })

        describe('When first invalid, second valid', () => {
          let output, code
          beforeAll(async () => {
            await cleanDatabase()
            setupFiles('first_invalid_second_valid')
            const res = runCommand(command)
            output = res[0]
            code = res[1]
          })
          afterAll(async () => {
            await cleanDatabase()
            resetMigrationsDirectory()
          })
          it(`${migrationsTable} table should contain 0 records`, async () => {
            expect(await tableIsEmpty(migrationsTable)).toBe(true)
          })
          it('should not create test1 table', async () => {
            expect(await tableExists('test1')).toBe(false)
          })
          it('should output type error', () => {
            expect(output.stderr).toMatch(/You have an error in your SQL syntax/)
          })
        })

        describe('When both valid', () => {
          let output, code
          beforeAll(async () => {
            await cleanDatabase()
            setupFiles('two_valid')
            const res = runCommand(command)
            output = res[0]
            code = res[1]
          })
          afterAll(async () => {
            await cleanDatabase()
            resetMigrationsDirectory()
          })
          it(`${migrationsTable} table should contain 2 records`, async () => {
            expect(await tableRecordCount(migrationsTable)).toBe(2)
          })
          it(`${migrationsTable} table should contain expected records`, async () => {
            expect(await tableContainsRecord(migrationsTable, {name: '01_create_test_table.js'})).toBe(true)
            expect(await tableContainsRecord(migrationsTable, {name: '02_add_count_to_test_table.js'})).toBe(true)
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
            it(`${migrationsTable} table should (still) contain 2 records`, async () => {
              expect(await tableRecordCount(migrationsTable)).toBe(2)
            })
          })
        })

      })
    })
  })
}
