import path from "path"
import {__approot} from './pathHelpers.js'

const defaults = {
  schemaMigrationPath: path.join(__approot, '/migrations/schema'),
  dataMigrationPath: path.join(__approot, '/migrations/data'),
  schemaMigrationTable: 'schema_migrations',
  dataMigrationTable: 'data_migrations',
};

let config = {...defaults}

const setConfig = newConfig => {
  config = {...config, ...newConfig};
}

const getConfig = () => {
  return config;
}

let initialized = false
if (!initialized) {
  try {
    const userSuppliedConfig = (await import(path.join(__approot, 'valkurmConfig.js'))).default
    setConfig(userSuppliedConfig)
    initialized = true
  } catch(e) {
    throw new Error(`No valid config found. Please export valid config object from valkurmConfig.js in your projects root: ${__approot}.`)
  }
}

export {
  setConfig,
  getConfig
};
