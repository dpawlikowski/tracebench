/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  $schema: "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  packageManager: "pnpm",
  // Explicit plugins so vitest + (optional) typescript checker load under pnpm.
  plugins: [
    "@stryker-mutator/vitest-runner",
  ],
  testRunner: "vitest",
  // Skip TS checker on first ship — keeps install/plugin surface small.
  checkers: [],
  mutate: [
    "packages/domain/src/**/*.ts",
    "packages/schemas/src/**/*.ts",
    "!packages/**/*.test.ts",
    "!packages/schemas/src/index.ts",
    "!packages/domain/src/index.ts",
  ],
  ignorePatterns: [
    "**/node_modules/**",
    "**/.next/**",
    "**/dist/**",
    "**/coverage/**",
    "apps/**",
    "docs/**",
  ],
  vitest: {
    configFile: "vitest.mutation.config.ts",
    related: false,
  },
  // First-run bar: report only — do not fail CI on score yet.
  thresholds: {
    high: 80,
    low: 50,
    break: null,
  },
  reporters: ["clear-text", "html", "json"],
  htmlReporter: { fileName: "reports/mutation/mutation.html" },
  jsonReporter: { fileName: "reports/mutation/mutation.json" },
  concurrency: 2,
  timeoutMS: 60_000,
  dryRunTimeoutMinutes: 5,
  disableTypeChecks: true,
};
