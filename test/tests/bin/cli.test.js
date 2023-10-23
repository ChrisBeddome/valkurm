import {runCommand, restoreGlobalConfig, deleteGlobalConfig, getSchemaMigrationFiles, getDataMigrationFiles} from '../helpers.js'

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
  })

  function generateMigrationExamples(cmd, getFileFn) {
    beforeAll(() => {
      command = `npm run valkurm ${cmd}`
    })
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

})






