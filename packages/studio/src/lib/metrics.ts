import type { CheckDomain, ProjectPayload } from "@/lib/api";

export type HealthLabel = "healthy" | "attention" | "critical";

export type ProjectMetrics = {
  healthScore: number;
  healthLabel: HealthLabel;
  slicesPresent: number;
  slicesTotal: number;
  routeCount: number;
  flagCount: number;
  envVarCount: number;
  pluginCount: number;
  validationPass: number;
  validationTotal: number;
  hasUnsavedChanges: boolean;
  changedDomains: string[];
  projectName: string;
};

const SLICE_KEYS = [
  "routes",
  "flags",
  "theme",
  "envSchema",
  "plugins",
  "config",
  "envExample",
] as const;

function countRoutes(routes: unknown): number {
  if (!routes || typeof routes !== "object") return 0;
  const r = routes as { tabs?: unknown[]; stack?: unknown[]; preApp?: unknown[] };
  return (r.tabs?.length ?? 0) + (r.stack?.length ?? 0) + (r.preApp?.length ?? 0);
}

function detectChangedDomains(
  draft: Record<string, unknown>,
  saved: Record<string, unknown>,
): string[] {
  const domains: string[] = [];
  if (JSON.stringify(draft.routes) !== JSON.stringify(saved.routes)) domains.push("routes");
  if (JSON.stringify(draft.flags) !== JSON.stringify(saved.flags)) domains.push("flags");
  if (JSON.stringify(draft.theme) !== JSON.stringify(saved.theme)) domains.push("theme");
  if (
    JSON.stringify(draft.envSchema) !== JSON.stringify(saved.envSchema) ||
    draft.envExampleText !== saved.envExampleText
  ) {
    domains.push("env");
  }
  return domains;
}

export function deriveProjectMetrics(
  project: ProjectPayload | null,
  check: CheckDomain[] | null,
  draft: Record<string, unknown>,
  saved: Record<string, unknown>,
): ProjectMetrics {
  const present = project?.present ?? {};
  const slicesPresent = SLICE_KEYS.filter((k) => present[k] === true).length;
  const slicesTotal = SLICE_KEYS.length;
  const slices = project?.slices ?? {};

  const routeCount = countRoutes(slices.routes);
  const flagCount =
    slices.flags && typeof slices.flags === "object"
      ? Object.keys(slices.flags as object).length
      : 0;
  const envSchema = slices.envSchema as { variables?: unknown[] } | undefined;
  const envVarCount = envSchema?.variables?.length ?? 0;
  const pluginCount = Array.isArray(slices.plugins) ? slices.plugins.length : 0;

  const validationTotal = check?.length ?? 7;
  const validationPass = check?.filter((d) => d.ok).length ?? 0;
  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(saved);
  const changedDomains = detectChangedDomains(draft, saved);

  const presenceScore = (slicesPresent / slicesTotal) * 40;
  const validationScore = check
    ? (validationPass / validationTotal) * 40
    : slicesPresent === slicesTotal
      ? 20
      : 0;
  const dirtyScore =
    !hasUnsavedChanges || (check?.every((d) => d.ok) ?? false) ? 20 : 0;

  let healthScore = Math.round(presenceScore + validationScore + dirtyScore);
  let healthLabel: HealthLabel = "healthy";

  const hasValidationFail = check?.some((d) => !d.ok) ?? false;
  const missingSlices = slicesPresent < slicesTotal;

  if (missingSlices || hasValidationFail) {
    healthLabel = healthScore <= 39 ? "critical" : "attention";
    if (missingSlices && healthScore > 59) healthScore = 59;
    if (hasValidationFail && healthScore > 59) healthScore = Math.min(healthScore, 59);
  }

  const cwd = project?.cwd ?? "";
  const projectName = cwd.split("/").pop() || "project";

  return {
    healthScore,
    healthLabel,
    slicesPresent,
    slicesTotal,
    routeCount,
    flagCount,
    envVarCount,
    pluginCount,
    validationPass,
    validationTotal,
    hasUnsavedChanges,
    changedDomains,
    projectName,
  };
}
