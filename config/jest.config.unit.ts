import baseConfig from './jest.config.base';

const config = {
  ...baseConfig,
  testRegex: '.*\\.test\\.ts$',
};

export default config;
