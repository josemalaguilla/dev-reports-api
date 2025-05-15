const config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testRegex: '.*\\.*test\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,js}'],
  coverageDirectory: '<rootDir>/coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/config/jest.setup.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^test/(.*)$': '<rootDir>/test/$1',
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/docker/',
    '/data/',
    '/docs/',
    '/test/',
    '/config/',
    '/tools/',
  ],
  maxWorkers: 2
};

export default config;
