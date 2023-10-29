import {runCommand} from '../../helpers/runHelpers.js'
import {deleteGlobalConfig} from '../../helpers/fileHelpers.js'
import fs from 'fs'

export default command => {
  describe('when no valkurmConfig.js exists', () => {
    beforeAll(() => {
      deleteGlobalConfig()
    })
    it('config should not exist', () => {
      const filepath = new URL('../../valkurmConfig.js', import.meta.url)
      expect(fs.existsSync(filepath)).toBe(false)
    })
    it('should exit with code 1', () => {
      const [output, code] = runCommand(command)
      expect(code).toBe(1)
    })
    it('should complain about missing config', () => {
      const [output, code] = runCommand(command)
      expect(output.stderr).toMatch(/No valid config found./)
    })
  })
}
