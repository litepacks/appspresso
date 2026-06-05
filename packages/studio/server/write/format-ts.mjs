/**
 * Deterministic TypeScript formatting helpers (no Prettier dependency).
 */

/**
 * @param {unknown} value
 * @param {number} indent
 */
export function formatValue(value, indent = 0) {
  const pad = "  ".repeat(indent);
  const padInner = "  ".repeat(indent + 1);

  if (value === null || value === undefined) return "undefined";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => `${padInner}${formatValue(v, indent + 1)}`);
    return `[\n${items.join(",\n")},\n${pad}]`;
  }
  if (typeof value === "object") {
    const entries = Object.keys(value)
      .sort()
      .filter((k) => value[k] !== undefined)
      .map(
        (k) =>
          `${padInner}${k}: ${formatValue(value[k], indent + 1)}`,
      );
    if (entries.length === 0) return "{}";
    return `{\n${entries.join(",\n")},\n${pad}}`;
  }
  return JSON.stringify(value);
}

/**
 * @param {string} importLine
 * @param {string} exportName
 * @param {string} constName
 * @param {unknown} data
 */
export function renderDefineFile(importLine, exportName, constName, data) {
  return `${importLine}\n\nexport const ${constName} = ${exportName}(${formatValue(data, 0)});\n`;
}
