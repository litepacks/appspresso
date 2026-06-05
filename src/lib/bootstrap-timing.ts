/** Max time for `runBootstrap()` before surfacing failure. */
export const BOOTSTRAP_DEADLINE_MS = 12_000;

/** Show stuck-bootstrap UI after this long in `loading` phase. */
export const BOOTSTRAP_STUCK_UI_MS = 10_000;

/** Force-hide native splash if bootstrap is still loading. */
export const BOOTSTRAP_FORCE_HIDE_SPLASH_MS = 15_000;
