import type { AppspressoRoutesConfig } from "@/studio/routes/schema";
import { appspressoRoutesSchema } from "@/studio/routes/schema";

export type RouteValidationIssue = {
  path: string;
  message: string;
};

export type RouteValidationResult = {
  ok: boolean;
  issues: RouteValidationIssue[];
};

function collectPaths(
  entries: AppspressoRoutesConfig["tabs"],
  prefix: string,
): RouteValidationIssue[] {
  const issues: RouteValidationIssue[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    const normalized = entry.path === "" ? "" : entry.path.replace(/^\//, "");
    if (seen.has(normalized)) {
      issues.push({
        path: prefix,
        message: `Duplicate route path: "${normalized || "(index)"}"`,
      });
    }
    seen.add(normalized);
    if (
      !entry.screen.startsWith("./") &&
      !entry.screen.startsWith("@/") &&
      !entry.screen.startsWith("appspresso/")
    ) {
      issues.push({
        path: prefix,
        message: `screen must start with ./, @/, or appspresso/: ${entry.screen}`,
      });
    }
  }
  return issues;
}

export function validateAppspressoRoutes(
  config: unknown,
): RouteValidationResult {
  const parsed = appspressoRoutesSchema.safeParse(config);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    };
  }
  const issues = [
    ...collectPaths(parsed.data.tabs, "tabs"),
    ...collectPaths(parsed.data.stack, "stack"),
    ...collectPaths(parsed.data.preApp, "preApp"),
  ];
  const tabIds = parsed.data.tabs.map((t) => t.id ?? t.path);
  const dupTabIds = tabIds.filter((id, i) => tabIds.indexOf(id) !== i);
  for (const id of new Set(dupTabIds)) {
    issues.push({ path: "tabs", message: `Duplicate tab id: "${id}"` });
  }
  return { ok: issues.length === 0, issues };
}
