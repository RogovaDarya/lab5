module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: [
    "app/**/*.js",
    "!app/models/index.js",
    "!app/config/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testMatch: ["**/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  forceExit: true,
  detectOpenHandles: true,
};
