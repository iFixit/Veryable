module.exports = {
  preset: "ts-jest",
  verbose: true,
  testEnvironment: 'jest-environment-node',
  transform: {},
  testMatch: [
     "<rootDir>/out/__tests__/**/*"
  ],
}