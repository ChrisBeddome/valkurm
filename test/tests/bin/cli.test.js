import {execSync} from 'child_process'

const runCommand = command => {
  let output = {}, exitCode
  try {
    output.stdout = execSync(command).toString()
  } 
  catch (error) {
    output.stderr = error.stderr.toString()
    exitCode = error.status
  }
  return [output, exitCode]
}


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
      beforeAll(() => {
        command = 'npm run valkurm generate-schema-migration'
      })
      describe('when no valkurmConfig.js exists', () => {
        it(`should exit with code 1`, () => {
          expect(code).toBe(1)
        })
        it('should complain about missing config', () => {
          expect(output.stderr).toMatch(/No valid config found./)
        })
      })
    })
  })
})
