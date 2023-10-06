let config = {};

const setConfig => newConfig => {
  config = { ...config, ...newConfig };
}

const getConfig = () => {
  return config;
}

export {
  setConfig,
  getConfig,
};
