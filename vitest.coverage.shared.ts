/**
 * Shared Vitest coverage defaults (unit tests in vite.config.ts).
 * HTML report: `coverage/index.html`; LCOV: `coverage/lcov.info`.
 */
export const sharedCoverageSettings = {
  provider: "v8" as const,
  reporter: ["text", "text-summary", "html", "lcov"],
  reportsDirectory: "./coverage",
  /** Surface files with no hits so gaps stay visible. */
  all: true,
  include: ["src/**/*.{ts,tsx}"],
  exclude: [
    "**/node_modules/**",
    "**/dist/**",
    "**/dist-lib/**",
    "**/*.d.ts",
    "**/vite.config.ts",
    "**/vitest*.ts",
    "**/vitest.workers.ts",
    "**/vitest.coverage.shared.ts",
    "**/tsup*.ts",
    "**/src/test/**",
    "**/*.test.{ts,tsx}",
  ],
};
