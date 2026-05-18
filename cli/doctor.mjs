import { existsSync } from "node:fs";
import { join } from "node:path";
import { findCapacitorCli, findViteCli } from "./paths.mjs";

function readNodeMajor() {
  const m = process.version.match(/^v(\d+)/);
  return m ? Number(m[1]) : 0;
}

/**
 * @param {string} cwd
 */
export async function runDoctor(cwd) {
  const lines = [];
  let exit = 0;

  const major = readNodeMajor();
  if (major < 20) {
    lines.push(
      `[warn] Node.js ${process.version}: Capacitor 7 expects Node 20+`,
    );
    exit = 1;
  } else {
    lines.push(`[ok] Node.js ${process.version}`);
  }

  const vite = findViteCli(cwd);
  lines.push(
    vite
      ? "[ok] Vite found in node_modules"
      : "[warn] Vite CLI not found (install vite in the project)",
  );
  if (!vite) exit = 1;

  const cap = findCapacitorCli(cwd);
  lines.push(
    cap
      ? "[ok] @capacitor/cli found"
      : "[info] @capacitor/cli not found (web-only or install @capacitor/cli)",
  );

  const android =
    existsSync(join(cwd, "android")) ||
    existsSync(join(cwd, "demo", "android"));
  const ios =
    existsSync(join(cwd, "ios")) || existsSync(join(cwd, "demo", "ios"));
  if (cap) {
    lines.push(
      android
        ? "[ok] android/ present"
        : "[info] android/ missing — run: npx cap add android",
    );
    lines.push(
      ios ? "[ok] ios/ present" : "[info] ios/ missing — run: npx cap add ios",
    );
  }

  if (process.platform === "darwin" && ios && cap) {
    lines.push(
      "[info] iOS: open ios/App in Xcode; run pod install in ios/App if needed",
    );
  }
  if (process.platform === "win32" || process.platform === "linux") {
    if (android && cap) {
      lines.push(
        "[info] Android: JDK + Android Studio; open android/ in Android Studio",
      );
    }
  }

  console.log("appspresso doctor\n");
  console.log(lines.join("\n"));
  console.log("");
  process.exit(exit);
}
