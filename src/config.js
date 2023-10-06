import path from "path"
import {__approot} from './pathHelpers.js'

let config = {};

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
    throw new Error(`No config found. Please export valid config object from valkurmConfig.js in your projects root: ${root}.`)
  }
}

export {
  setConfig,
  getConfig
};