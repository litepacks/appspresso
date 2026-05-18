/** Shared Vitest worker tuning (unit + integration configs). */
export function resolveVitestMaxWorkers(): number | undefined {
  const raw = process.env.VITEST_MAX_WORKERS;
  if (raw === undefined || raw === "") return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}
