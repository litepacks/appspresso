import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const repoRoot = join(__dirname, "../..");

export const maestroRoot = join(repoRoot, "e2e/maestro");
export const maestroConfig = join(maestroRoot, "config.yaml");
export const flowsShared = join(maestroRoot, "shared");
export const flowsAndroid = join(maestroRoot, "android");
export const flowsIos = join(maestroRoot, "ios");

export const defaultAndroidApk = join(
  repoRoot,
  "demo/android/app/build/outputs/apk/debug/app-debug.apk",
);
