module.exports = {
  preset: "ts-jest",
  verbose: true,
  testEnvironment: 'jest-environment-node',
  transform: {},
  testMatch: [
    "<rootDir>/__tests__/**/?(*.)(spec|test).ts",
  ],
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!<rootDir>/__tests__/__helper.ts",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!**/logs/**",
    "!**/out/**"
  ],
}