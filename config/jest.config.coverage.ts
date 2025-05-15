import baseConfig from './jest.config.base';

const config = {
  ...baseConfig,
  testTimeout: 30000
};

export default config;
