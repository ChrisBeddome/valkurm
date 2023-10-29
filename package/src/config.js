import path from "path"
import {__approot} from './pathHelpers.js'

const defaultConfig = Object.freeze({
  schemaMigrationPath: path.join(__approot, '/migrations/schema'),
  dataMigrationPath: path.join(__approot, '/migrations/data'),
  schemaMigrationTable: 'schema_migrations',
  dataMigrationTable: 'data_migrations',
})

let config = {}

let initialized = false
const initializeConfig = async () => {
  if (!initialized) {
    try {
      const userSuppliedConfig = (await import(path.join(__approot, 'valkurmConfig.js'))).default
      setConfig({...defaultConfig, ...userSuppliedConfig})
      initialized = true
    } catch(e) {
      throw new Error(`No valid config found. Please export a valid config object from valkurmConfig.js in your projects root: ${__approot}.`)
    }
  }
}

const setConfig = newConfig => {
  config = {...config, ...newConfig}
}

const getConfig = async () => {
  await initializeConfig()
  return config
}

export {
  setConfig,
  getConfig
}
