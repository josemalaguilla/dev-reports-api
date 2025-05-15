import baseConfig from './jest.config.base';

const config = {
  ...baseConfig,
  testTimeout: 10000,
  testRegex: '.*\\.int-test\\.ts$',
};

export default config;
