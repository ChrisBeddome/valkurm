let config = {};

const setConfig => newConfig => {
  config = { ...config, ...newConfig };
}

const getConfig = () => {
  return config;
}

module.exports = {
  setConfig,
  getConfig,
};
