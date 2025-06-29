/** @type {import('jest').Config} */
export default {
  transform: {
    '^.+\\.js$': ['babel-jest', { 
      configFile: './babel.config.js'
    }]
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|commander|inquirer|ora|table)/)'
  ],
  moduleFileExtensions: ['js', 'json', 'node']
};