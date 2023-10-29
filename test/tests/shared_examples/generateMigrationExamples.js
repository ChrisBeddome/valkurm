import {runCommand} from '../../helpers/runHelpers.js'

import {
  restoreGlobalConfig,
  deleteMigrationsDirectory
} from '../../helpers/fileHelpers.js'

export default (baseCommand, getFileFn) => {
  describe(`when command = ${baseCommand}`, () => {
    let command = baseCommand
    let code, output
    describe('when valid valkurmConfig.js exists', () => {

      beforeAll(() => {
        deleteMigrationsDirectory()
        restoreGlobalConfig()
      })

      beforeEach(() => {
        [output, code] = runCommand(command)
      })

      it(`should exit with code 1`, () => {
        expect(1).toBe(1)
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
          command = `${baseCommand} ${migrationName}`
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
  })
}

