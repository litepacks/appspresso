/**
 * Vite static asset contract:
 *
 * - **`public/`** — use `publicAssetUrl("icon.svg")`; safe with `base: "./"` (Capacitor).
 * - **files under `src/`** — `import logo from "./logo.png"` (hashed output, tree-shake).
 * - **`new URL("./x.png", import.meta.url)`** — relative path in `src` without glob.
 */

/**
 * Browser URL for a file under `public/` root.
 *
 * @param path — `icon.svg`, `/splash.svg`, `public/icon.svg` (leading `/` and `public/` stripped)
 */
export function publicAssetUrl(path: string): string {
  const raw =
    typeof import.meta !== "undefined" &&
    import.meta.env != null &&
    typeof import.meta.env.BASE_URL === "string"
      ? import.meta.env.BASE_URL
      : "/";
  const base = raw.replace(/\/?$/, "/");
  const trimmed = path.trim().replace(/^\/+/u, "");
  const relative = trimmed.startsWith("public/")
    ? trimmed.slice("public/".length)
    : trimmed;
  return `${base}${relative}`;
}
