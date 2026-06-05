import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Resolve Android SDK root (emulator + platform-tools).
 * @returns {string | null}
 */
export function resolveAndroidSdkRoot() {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    process.platform === "darwin"
      ? join(homedir(), "Library/Android/sdk")
      : null,
    process.platform === "win32"
      ? join(process.env.LOCALAPPDATA || "", "Android", "Sdk")
      : join(homedir(), "Android", "Sdk"),
  ].filter(Boolean);

  for (const root of candidates) {
    if (
      existsSync(join(root, "emulator", "emulator")) ||
      existsSync(join(root, "emulator", "emulator.exe")) ||
      existsSync(join(root, "platform-tools", "adb"))
    ) {
      return root;
    }
  }
  return null;
}

/**
 * @param {string} sdkRoot
 * @param {string} subdir
 * @param {string} name
 */
function toolPath(sdkRoot, subdir, name) {
  const base = join(sdkRoot, subdir, name);
  if (process.platform === "win32" && !name.endsWith(".exe")) {
    const win = `${base}.exe`;
    if (existsSync(win)) return win;
  }
  return existsSync(base) ? base : null;
}

/**
 * @returns {{ sdkRoot: string, emulator: string, adb: string } | null}
 */
export function resolveAndroidTools() {
  const sdkRoot = resolveAndroidSdkRoot();
  if (!sdkRoot) return null;

  const emulator = toolPath(sdkRoot, "emulator", "emulator");
  const adb = toolPath(sdkRoot, "platform-tools", "adb");
  if (!emulator || !adb) return null;

  return { sdkRoot, emulator, adb };
}
