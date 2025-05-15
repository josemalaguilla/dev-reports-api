import baseConfig from './jest.config.base';

const config = {
  ...baseConfig,
  testRegex: '.*\\.e2e-test\\.ts$',
  testTimeout: 30000
};

export default config;
