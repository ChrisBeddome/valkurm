import {exec, spawn} from 'child_process'

const runCommand = commandArgs => {
  let output = {
    stdout: '',
    stderr: ''
  }
  const process = spawn("npm", ["run", "valkurm", ...commandArgs ])
  process.stdout.on("data", data => {
    output.stdout += data.toString()
  })
  process.stderr.on("data", data => {
    output.stderr += data.toString()
  })
  return [process, output]
} 

const shouldExitWithCode = (expectedCode, process , done) => {
  process.on("exit", code => {
    try {
      expect(code).toBe(expectedCode);
      done()
    } catch(error) {
      done(error)
    }
  });
}

const outputShouldMatch = (output, key, matcher, process, done) => {
  process.on("exit", _code => {
    try {
      expect(output[key]).toMatch(matcher)
      done()
    } catch(error) {
      done(error)
    }
  });
}

describe("entry executable", () => {

  let process, output

  describe("when given no command", () => {
    beforeEach(() => {
      [process, output] = runCommand([])
    })

    it(`should exit with code 1`, done => {
      shouldExitWithCode(1, process, done)
    })

    it("should output usage information", done => {
      outputShouldMatch(output, 'stderr', /Usage:/, process, done)
    })
  })
  
  describe("when given invalid command", () => {
    beforeEach(() => {
      [process, output] = runCommand(["sdfsdf"])
    })

    it(`should exit with code 1`, done => {
      shouldExitWithCode(1, process, done)
    })

    it("should output usage information", done => {
      outputShouldMatch(output, 'stderr', /Command 'sdfsdf' not recognized/, process, done)
    })
  })

})
