import path from "path"
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const root = path.resolve(__dirname).split('src')[0]

let config = {};

const setConfig = newConfig => {
  config = { ...config, ...newConfig };
}

const getConfig = () => {
  return config;
}

let initialized = false
if (!initialized) {
  try {
    const userSuppliedConfig = (await import(path.join(root, 'valkurmConfig.js'))).default
    setConfig(userSuppliedConfig)
    initialized = true
  } catch(e) {
    throw new Error(`No config found. Please export valid config object from valkurmConfig.js in your projects root: ${root}.`)
  }
}

export {
  setConfig,
  getConfig,
};
