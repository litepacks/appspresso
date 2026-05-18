/**
 * Sanitizes input to a safe `tel:` number; `null` if invalid.
 * Strips spaces, parens, dashes; at least three digits required.
 */
export function normalizeTelNumber(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;

  const collapsed = t.replace(/[\s().-]/g, "");
  if (!/^\+?[\d*#]+(?:[,;][\d*#]+)*$/i.test(collapsed)) return null;

  const digitCount = (collapsed.match(/\d/g) ?? []).length;
  if (digitCount < 3) return null;

  return collapsed;
}

/** Whether `tel:` works in browser (false in SSR). */
export function isPhoneDialEnvironment(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.location?.assign === "function"
  );
}

/**
 * Tries to open dialer via `tel:`.
 * @returns `true` if number valid and navigation happened
 */
export function openPhoneDial(raw: string): boolean {
  const n = normalizeTelNumber(raw);
  if (n == null || !isPhoneDialEnvironment()) return false;
  window.location.assign(`tel:${n}`);
  return true;
}

/** `tel:` URI for tests or `href`; `null` if invalid. */
export function getTelHref(raw: string): string | null {
  const n = normalizeTelNumber(raw);
  return n == null ? null : `tel:${n}`;
}
