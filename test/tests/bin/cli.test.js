import {runCommand} from '../../helpers/runHelpers.js'

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
})

