export type CheckIssue = { path?: string; message: string };

export type CheckDomain = {
  domain: string;
  ok: boolean;
  issues: CheckIssue[];
};

export type ProjectPayload = {
  cwd: string;
  present: Record<string, boolean>;
  slices: Record<string, unknown>;
};

export async function fetchProject(): Promise<ProjectPayload> {
  const res = await fetch("/api/project");
  if (!res.ok) throw new Error("Failed to load project");
  return res.json();
}

export async function fetchCapacitorPreview() {
  const res = await fetch("/api/capacitor-preview");
  return res.json();
}

export async function runCheck(): Promise<{ ok: boolean; domains: CheckDomain[] }> {
  const res = await fetch("/api/check", { method: "POST" });
  if (!res.ok) throw new Error("Check failed");
  return res.json();
}

export async function applySlices(body: Record<string, unknown>) {
  const res = await fetch("/api/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Apply failed");
  return data;
}
