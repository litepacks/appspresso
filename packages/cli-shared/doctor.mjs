import { existsSync } from "node:fs";
import { join } from "node:path";
import * as p from "@clack/prompts";

function readNodeMajor() {
  const m = process.version.match(/^v(\d+)/);
  return m ? Number(m[1]) : 0;
}

/**
 * @param {string} cwd
 * @param {{ findViteCli?: (cwd: string) => string | null, findCapacitorCli?: (cwd: string) => string | null }} [deps]
 */
export async function runDoctor(cwd, deps = {}) {
  const findViteCli =
    deps.findViteCli ??
    (() => {
      return existsSync(join(cwd, "node_modules", "vite", "bin", "vite.js"))
        ? "vite"
        : null;
    });
  const findCapacitorCli =
    deps.findCapacitorCli ??
    (() => {
      const cap = join(cwd, "node_modules", "@capacitor", "cli", "bin", "cap");
      return existsSync(cap) ? cap : null;
    });

  p.intro("Environment check");

  let exit = 0;
  const major = readNodeMajor();
  if (major < 20) {
    p.log.warn(`Node.js ${process.version}: Capacitor 7 expects Node 20+`);
    exit = 1;
  } else {
    p.log.success(`Node.js ${process.version}`);
  }

  const vite = findViteCli(cwd);
  if (vite) {
    p.log.success("Vite found in node_modules");
  } else {
    p.log.warn("Vite CLI not found (install vite in the project)");
    exit = 1;
  }

  const cap = findCapacitorCli(cwd);
  if (cap) {
    p.log.success("@capacitor/cli found");
  } else {
    p.log.info("@capacitor/cli not found (web-only or install @capacitor/cli)");
  }

  const android =
    existsSync(join(cwd, "android")) ||
    existsSync(join(cwd, "demo", "android"));
  const ios =
    existsSync(join(cwd, "ios")) || existsSync(join(cwd, "demo", "ios"));

  if (cap) {
    if (android) p.log.success("android/ present");
    else p.log.info("android/ missing — run: npx cap add android");

    if (ios) p.log.success("ios/ present");
    else p.log.info("ios/ missing — run: npx cap add ios");
  }

  if (process.platform === "darwin" && ios && cap) {
    p.log.info(
      "iOS: open ios/App in Xcode; run pod install in ios/App if needed",
    );
  }
  if (
    (process.platform === "win32" || process.platform === "linux") &&
    android &&
    cap
  ) {
    p.log.info(
      "Android: JDK + Android Studio; open android/ in Android Studio",
    );
  }

  if (exit === 0) {
    p.outro("All critical checks passed");
  } else {
    p.outro("Some checks need attention");
  }
  process.exit(exit);
}
