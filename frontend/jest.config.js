module.exports = {
  moduleNameMapper: {
    '\\.(scss|sass|css)$': 'identity-obj-proxy',
    '\\.svg$': 'jest-svg-transformer',
    '\\.(png)$': '<rootDir>/__mocks__/fileMock.js',
  },
  collectCoverageFrom: ['src/**/*.{js,jsx}', ],
  testEnvironment: 'jsdom',
  globals: {
    usingJSDOM: true,
    usingJest: true
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '/build/', '<rootDir>/src/setupTests.js', '<rootDir>/src/reportWebVitals.js'],

  coverageDirectory: 'coverage',
  testMatch: [
    '<rootDir>/tests/**'
  ],
  coverageReporters: [
    'text',
    'lcov',
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20
    }
  },
  watchPathIgnorePatterns: [
    'node_modules'
  ],
  transformIgnorePatterns: [ 'node_modules' ],
  coverageProvider: 'v8',
  restoreMocks: true,
  setupFilesAfterEnv: [
    "<rootDir>/src/setupTests.js"
  ]
  
  // verbose: true
};