import { runCommand } from '../../helpers/runHelpers.js'

import {
  restoreGlobalConfig,
  deleteGlobalConfig,
  getSchemaMigrationFiles,
  getDataMigrationFiles,
  deleteMigrationsDirectory,
  resetMigrationsDirectory,
  setupSchemaMigrationFiles
} from '../../helpers/fileHelpers.js'

import {
  tableExists,
  tableIsEmpty,
  tableRecordCount,
  tableContainsRecord
} from '../../helpers/databaseHelpers.js'

describe('entry executable', () => {
  let command, code, output

  beforeEach(() => {
    [output, code] = runCommand(command)
  })

  describe('when given no command', () => {
    beforeAll(() => {
      command = 'npm run valkurm'
    })
    it(`should exit with code 1`, () => {
      expect(code).toBe(1)
    })
    it('should output usage information', () => {
      expect(output.stderr).toMatch(/Usage:/)
    })
  })
  
  describe('when given invalid command', () => {
    beforeAll(() => {
      command = 'npm run valkurm this-is-an-invalid-command'
    })
    it(`should exit with code 1`, () => {
      expect(code).toBe(1)
    })
    it('should output usage information', () => {
      expect(output.stderr).toMatch(/Command 'this-is-an-invalid-command' not recognized/)
    })
  })

  describe('when given valid command', () => {
    describe('when command = generate-schema-migration', () => {
      generateMigrationExamples('generate-schema-migration', getSchemaMigrationFiles)
    })
    describe('when command = generate-data-migration', () => {
      generateMigrationExamples('generate-data-migration', getDataMigrationFiles)
    })
    describe('when command = migrate-schema', () => {
      beforeAll(() => {
        command = `npm run valkurm migrate-schema`
      })

      missingConfigExamples()

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

          describe('When non-string returned from up()', () => {
            beforeAll(() => {
              setupSchemaMigrationFiles('non_string_returned_from_up')
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

              })
            })
          })
        })
      })
    })
  })

  function generateMigrationExamples(cmd, getFileFn) {
    beforeAll(() => {
      command = `npm run valkurm ${cmd}`
      deleteMigrationsDirectory()
    })

    missingConfigExamples()

    describe('when valid valkurmConfig.js exists', () => {
      beforeAll(() => {
        restoreGlobalConfig()
      })

      describe('when passed no options', () => {
        it(`should exit with code 1`, () => {
          expect(code).toBe(1)
        })
        it('should complain about missing name arg', () => {
          expect(output.stderr).toMatch(/Please provide a valid file name./)
        })
      })

      describe('when passed name', () => {
        const migrationName = 'test-migration'
        beforeAll(() => {
          command = `npm run valkurm ${cmd} ${migrationName}`
        })
        it('should not output any errors', () => {
          expect(output.stderr).toBeFalsy()
        })
        it('should output success message that includes filename', () => {
          let regex = new RegExp(`Generated file: [\\w._\\/]+${migrationName}.js`);
          expect(output.stdout).toMatch(regex)
        })
        it('should create file in migrations directory', () => {
          const files = getFileFn()
          const pattern = /\d+Z_[\w\d\s.,!?-]+.js/g
          const match = output.stdout.match(pattern)[0]
          expect (files.includes(match)).toBe(true)
        })
      })
    })
  }
  
  function missingConfigExamples() {
    describe('when no valkurmConfig.js exists', () => {
      beforeAll(() => {
        deleteGlobalConfig()
      })
      it(`should exit with code 1`, () => {
        expect(code).toBe(1)
      })
      it('should complain about missing config', () => {
        expect(output.stderr).toMatch(/No valid config found./)
      })
    })
  }

})

