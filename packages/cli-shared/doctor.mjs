import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import * as p from "@clack/prompts";
import { readAppspressoProjectInfo } from "./project-info.mjs";

function readNodeMajor() {
  const m = process.version.match(/^v(\d+)/);
  return m ? Number(m[1]) : 0;
}

/**
 * @param {string} cwd
 */
function checkMaestroAppId(cwd) {
  const maestroYaml = join(cwd, "e2e/maestro/config.yaml");
  const configTs = join(cwd, "appspresso.config.ts");
  if (!existsSync(maestroYaml) || !existsSync(configTs)) return null;
  const yaml = readFileSync(maestroYaml, "utf8");
  const cfg = readFileSync(configTs, "utf8");
  const maestroMatch = yaml.match(/^appId:\s*(\S+)/m);
  const demoMatch = cfg.match(/\bid:\s*"([^"]+)"/);
  if (!maestroMatch || !demoMatch) return null;
  if (maestroMatch[1] !== demoMatch[1]) {
    return `Maestro appId (${maestroMatch[1]}) ≠ config (${demoMatch[1]})`;
  }
  return null;
}

/**
 * @param {string} cwd
 * @param {{ findViteCli?: (cwd: string) => string | null, findCapacitorCli?: (cwd: string) => string | null }} [deps]
 */
export async function runDoctor(cwd, deps = {}) {
  const findViteCli =
    deps.findViteCli ??
    (() =>
      existsSync(join(cwd, "node_modules", "vite", "bin", "vite.js"))
        ? "vite"
        : null);
  const findCapacitorCli =
    deps.findCapacitorCli ??
    (() => {
      const cap = join(cwd, "node_modules", "@capacitor", "cli", "bin", "cap");
      return existsSync(cap) ? cap : null;
    });

  const project = readAppspressoProjectInfo(cwd);

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

  if (project.appspressoVersion) {
    p.log.success(`appspresso dependency: ${project.appspressoVersion}`);
  } else {
    p.log.warn("appspresso not in package.json dependencies");
    exit = 1;
  }

  if (project.hasConfig) {
    p.log.success("appspresso.config.ts");
  } else {
    p.log.warn("appspresso.config.ts missing");
    exit = 1;
  }

  if (project.hasEnv) {
    p.log.success(".env");
  } else if (project.hasEnvExample) {
    p.log.warn("Copy env: cp .env.example .env");
  }

  const cap = findCapacitorCli(cwd);
  if (cap) {
    p.log.success("@capacitor/cli found");
  } else {
    p.log.info("@capacitor/cli not found (web-only or install @capacitor/cli)");
  }

  const android = project.hasAndroid;
  const ios = project.hasIos;

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
      "Android: set JAVA_HOME to JDK 21; open android/ in Android Studio",
    );
    if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT) {
      p.log.warn("ANDROID_HOME / ANDROID_SDK_ROOT not set");
    }
  }

  const pluginsFile = join(cwd, "src", "appspresso.plugins.ts");
  const pluginsRoot = join(cwd, "appspresso.plugins.ts");
  if (existsSync(pluginsFile) || existsSync(pluginsRoot)) {
    p.log.success("appspresso.plugins.ts found");
  }

  const pkgPath = join(cwd, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };
    const pluginDeps = Object.keys(deps).filter((k) =>
      k.startsWith("@appspresso/plugin-"),
    );
    if (pluginDeps.length > 0) {
      p.log.success(`Appspresso plugins: ${pluginDeps.join(", ")}`);
    }
  }

  const maestroMismatch = checkMaestroAppId(cwd);
  if (maestroMismatch) {
    p.log.warn(maestroMismatch);
    p.log.info(
      "Fix: align e2e/maestro/config.yaml with appspresso.config.ts app.id",
    );
  }

  try {
    const javaOut = execSync("java -version 2>&1", { encoding: "utf8" });
    const majorMatch = javaOut.match(/version "(\d+)/);
    const javaMajor = majorMatch ? Number(majorMatch[1]) : 0;
    if (javaMajor > 0 && javaMajor < 21) {
      p.log.warn(
        `JDK ${javaMajor} detected — Capacitor 7 / AGP 8.7 in this repo expect JDK 21`,
      );
    } else {
      p.log.success(
        javaMajor >= 21
          ? `JDK ${javaMajor} on PATH (Android builds)`
          : "java on PATH (Android builds)",
      );
    }
  } catch {
    if (android) {
      p.log.warn("java not found — required for Android Gradle builds (JDK 21)");
    }
  }

  const demoDist = join(cwd, "demo", "dist", "index.html");
  const localDist = join(cwd, "dist", "index.html");
  if (existsSync(demoDist)) {
    let bytes = 0;
    const walk = (dir) => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        const st = statSync(p);
        if (st.isDirectory()) walk(p);
        else bytes += st.size;
      }
    };
    walk(join(cwd, "demo", "dist"));
    p.log.success(`demo/dist present (${Math.round(bytes / 1024)} KiB)`);
  } else if (project.hasConfig && existsSync(join(cwd, "demo", "appspresso.config.ts"))) {
    p.log.warn("demo/dist missing — run: npm run demo:build");
    exit = 1;
  } else if (existsSync(localDist)) {
    p.log.success("dist/ present");
  }

  const androidPublic = join(
    cwd,
    "demo",
    "android",
    "app",
    "src",
    "main",
    "assets",
    "public",
    "index.html",
  );
  if (existsSync(androidPublic)) {
    p.log.success("demo/android assets/public synced");
  } else if (existsSync(join(cwd, "demo", "android"))) {
    p.log.warn(
      "demo/android assets/public missing — run: npm run demo:build && appspresso native sync android",
    );
  }

  if (exit === 0) {
    p.outro("All critical checks passed");
  } else {
    p.outro("Some checks need attention");
  }
  process.exit(exit);
}
