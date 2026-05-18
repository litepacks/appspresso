/**
 * Integration tests import via `dist-lib`; coverage reports only output files that were actually loaded.
 */
export const integrationCoverageSettings = {
  provider: "v8" as const,
  reporter: ["text", "text-summary", "html", "lcov"],
  reportsDirectory: "./coverage-integration",
  /** Count only files executed in tests instead of listing all of `dist-lib` */
  all: false,
  include: ["dist-lib/**/*.js"],
  exclude: ["**/*.map", "**/node_modules/**"],
};
