module.exports = {
  preset: "ts-jest",
  verbose: true,
  testEnvironment: 'jest-environment-node',
  globalTeardown: "<rootDir>/__tests__/jest-teardown.ts",
  transform: {},
  testMatch: [
    "<rootDir>/__tests__/**/?(*.)(spec|test).ts",
  ],
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!<rootDir>/__tests__/__helper.ts",
    "!<rootDir>/__tests__/jest-teardown.ts",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!**/logs/**",
    "!**/dist/**"
  ],
}