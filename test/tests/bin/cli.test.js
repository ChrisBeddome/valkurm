import {execSync} from 'child_process'

const exitCodeFromCommand = command => {
  let exitCode
  try {
    execSync(command).toString()
  } 
  catch (error) {
    exitCode = error.status
  }
  return exitCode
}

const outputFromCommand = (command, fileDescriptor) => {
  let output
  try {
    execSync(command).toString()
  } 
  catch (error) {
    output = error[fileDescriptor].toString()
  }
  return output
}

describe('entry executable', () => {
  describe('when given no command', () => {
    const command = 'npm run valkurm'
    it(`should exit with code 1`, () => {
      const code = exitCodeFromCommand(command)
      expect(code).toBe(1)
    })
    it('should output usage information', () => {
      const stderr = outputFromCommand(command, 'stderr')
      expect(stderr).toMatch(/Usage:/)
    })
  })
  
  describe('when given invalid command', () => {
    const command = 'npm run valkurm this-is-an-invalid-command'
    it(`should exit with code 1`, () => {
      const code = exitCodeFromCommand(command)
      expect(code).toBe(1)
    })
    it('should output usage information', () => {
      const stderr = outputFromCommand(command, 'stderr')
      expect(stderr).toMatch(/Command 'this-is-an-invalid-command' not recognized/)
    })
  })

  describe('when given valid command', () => {
    describe('when command = generate-schema-migration' () => {
      const command = 'npm run valkurm generate-schema-migration'
    })
  })
})
