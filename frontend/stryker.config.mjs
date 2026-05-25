/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
const config = {
  _comment: "Stryker configuration for Variant 3",
  mutate: [
    "src/helper/getHref.js",
    "src/helper/sheduleUtils.js"
  ],
  testRunner: "jest",
  reporters: ["html", "clear-text", "progress"],
  htmlReporter: {
    fileName: "reports/mutation/mutation.html"
  },
  coverageAnalysis: "perTest",
  disableTypeChecks: true, 

  jest: {
    projectType: "custom",
    config: {
      testRegex: "sheduleUtils\\.test\\.js$",
      setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
      transform: {
        "^.+\\.(js|jsx|mjs|cjs|ts|tsx)$": "react-scripts/config/jest/babelTransform.js"
      },
      transformIgnorePatterns: [
        "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$"
      ]
    }
  }
};

export default config;