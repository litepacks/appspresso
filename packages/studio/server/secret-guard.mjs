import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SECRET_PATTERNS = [
  /sk_live_/i,
  /sk_test_/i,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
  /xox[baprs]-/i,
];

/**
 * @param {string} text
 */
function looksLikeSecret(text) {
  if (!text || text.length < 8) return false;
  for (const re of SECRET_PATTERNS) {
    if (re.test(text)) return true;
  }
  return false;
}

/**
 * @param {string} cwd
 * @returns {{ ok: boolean, issues: Array<{ file: string, message: string }> }}
 */
export function checkSecretLeaks(cwd) {
  /** @type {Array<{ file: string, message: string }>} */
  const issues = [];

  let staged = "";
  try {
    staged = execSync("git diff --cached --name-only", {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return { ok: true, issues: [] };
  }

  const trackedEnvLike = staged
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((f) => /^\.env(\.|$)/.test(f) && f !== ".env.example");

  for (const file of trackedEnvLike) {
    issues.push({
      file,
      message: "Do not stage .env files — use .env.example for non-secret placeholders",
    });
  }

  const examplePath = join(cwd, ".env.example");
  if (existsSync(examplePath)) {
    const text = readFileSync(examplePath, "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      const [, key, val] = m;
      const trimmed = val.trim().replace(/^["']|["']$/g, "");
      if (trimmed && looksLikeSecret(trimmed)) {
        issues.push({
          file: ".env.example",
          message: `${key} looks like a real secret — use a placeholder`,
        });
      }
    }
  }

  return { ok: issues.length === 0, issues };
}
