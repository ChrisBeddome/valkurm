export default {
  roots: ['../tests'],
  setupFilesAfterEnv: ['./testSetup.js'],
  globalTeardown: "./testTeardown.js",
  runner: "jest-serial-runner"
}
