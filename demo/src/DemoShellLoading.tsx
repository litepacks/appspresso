/** Bootstrap shell fallback — no i18n (providers not mounted yet). */
export function DemoShellLoading() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-[#0f172a]">
      <p className="text-sm tracking-wide text-white/65">Loading…</p>
    </div>
  );
}
