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
    /** Template demo pages — unstable surface; covered by app/e2e, not unit thresholds. */
    "**/src/pages/**",
    "**/src/dev/**",
    "**/src/app/router.tsx",
    "**/src/app/App.tsx",
  ],
  thresholds: {
    lines: 68,
    functions: 64,
    branches: 56,
    statements: 65,
  },
};
