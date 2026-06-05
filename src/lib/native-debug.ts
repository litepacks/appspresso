/** True when native debug overlay / verbose boot errors are enabled. */
export function isNativeDebugEnabled(): boolean {
  return (
    import.meta.env.DEV || import.meta.env.VITE_NATIVE_DEBUG === "true"
  );
}
