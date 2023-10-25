import { getConn, release } from '../../dbConnect.js'

import {
  runCommand,
  restoreGlobalConfig,
  deleteGlobalConfig,
  getSchemaMigrationFiles,
  getDataMigrationFiles,
  deleteMigrationsDirectory,
  resetMigrationsDirectory
} from '../helpers.js'

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
        let connection
        beforeAll(async () => {
          restoreGlobalConfig()
          connection = await getConn()
        })
        afterAll(async () => {
          await release()
        })

        it('should create schema_migrations table', async () => {
          const getTablesSQL = `
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = '${process.env.DB_NAME}';
          `
          const [rows, fields] = await connection.query(getTablesSQL)
          const tableNames = rows.map(row => row.table_name)
          expect(tableNames.includes('schema_migrations')).toBe(true)
        })

        describe('when schema_migrations directory empty', () => {
          beforeAll(() => {
            resetMigrationsDirectory()
          })
          it('schema_migrations table should be empty', async () => {
            const SQL = 'SELECT count(*) as count FROM schema_migrations;'
            const [rows, fields] = await connection.query(SQL)
            expect(rows[0].count).toBe(0)
          })
        })
        
      })
    })
  })

  function generateMigrationExamples(cmd, getFileFn) {
    beforeAll(() => {
      command = `npm run valkurm ${cmd}`
      // deleteMigrationsDirectory()
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

