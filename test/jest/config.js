export default {
  roots: ['../tests'],
  setupFilesAfterEnv: ['./testSetup.js'],
  globalTeardown: "./testTeardown.js",
  maxWorkers: 1 //force tests to run serially
}
