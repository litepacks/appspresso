/** Whether `navigator.clipboard.readText` is available for paste */
export function isClipboardReadSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.clipboard &&
    typeof navigator.clipboard.readText === "function"
  );
}

/** Whether `navigator.clipboard.writeText` is available (secure context required) */
export function isClipboardWriteSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  );
}

/** Okuma veya yazmadan en az biri */
export function isClipboardApiAvailable(): boolean {
  return isClipboardReadSupported() || isClipboardWriteSupported();
}

/**
 * Writes text to clipboard. Fails outside HTTPS / localhost in most browsers.
 */
export async function writeClipboardText(text: string): Promise<void> {
  if (!isClipboardWriteSupported()) {
    throw new Error("Clipboard write is not supported in this environment.");
  }
  await navigator.clipboard.writeText(text);
}

/**
 * Reads plain text from clipboard; may require permission.
 */
export async function readClipboardText(): Promise<string> {
  if (!isClipboardReadSupported()) {
    throw new Error("Clipboard read is not supported in this environment.");
  }
  return navigator.clipboard.readText();
}
