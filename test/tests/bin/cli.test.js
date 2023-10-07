import {exec, spawn} from 'child_process'

describe("entry executable", () => {
  describe("when given no command", () => {
    let process
    let stdout
    let stderr 
    beforeEach(() => {
      stdout = ''
      stderr = ''
      process = spawn("npm", ["run", "valkurm"])
      process.stdout.on("data", data => {
        stdout += data.toString()
      })
      process.stderr.on("data", data => {
        stderr += data.toString()
      })
    })
    it("should exit with code 1", done => {
      process.on("exit", code => {
        try {
          expect(code).toBe(1);
          done()
        } catch(error) {
          done(error)
        }
      });
    });
    it("should output usage information", done => {
      process.on("exit", _code => {
        try {
          expect(stderr).toMatch(/Usage:/)
          done()
        } catch(error) {
          done(error)
        }
      });
    })
  })
})
