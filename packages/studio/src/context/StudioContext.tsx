import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applySlices,
  fetchCapacitorPreview,
  fetchProject,
  runCheck,
  type CheckDomain,
  type ProjectPayload,
} from "@/lib/api";
import { appendValidationHistory } from "@/lib/validation-history";
type Message = { type: "ok" | "err"; text: string } | null;

type StudioContextValue = {
  project: ProjectPayload | null;
  draft: Record<string, unknown>;
  setDraft: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  saved: Record<string, unknown>;
  check: CheckDomain[] | null;
  checking: boolean;
  saving: boolean;
  dirty: boolean;
  message: Message;
  setMessage: (m: Message) => void;
  capPreview: unknown;
  onCheck: () => Promise<void>;
  onApply: () => Promise<void>;
  onDiscard: () => void;
  reload: () => Promise<void>;
  openCommandPalette: () => void;
  setOpenCommandPalette: (fn: () => void) => void;
};

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<ProjectPayload | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [saved, setSaved] = useState<Record<string, unknown>>({});
  const [check, setCheck] = useState<CheckDomain[] | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [capPreview, setCapPreview] = useState<unknown>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paletteOpener, setPaletteOpener] = useState<(() => void) | null>(null);

  const reload = useCallback(async () => {
    const p = await fetchProject();
    setProject(p);
    const slices = {
      routes: p.slices.routes,
      flags: p.slices.flags,
      theme: p.slices.theme,
      envSchema: p.slices.envSchema,
      envExampleText: p.slices.envExampleText,
    };
    setDraft(slices);
    setSaved(slices);
    const cap = await fetchCapacitorPreview();
    setCapPreview(cap);
  }, []);

  useEffect(() => {
    reload().catch((e) => setMessage({ type: "err", text: String(e) }));
  }, [reload]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved],
  );

  const onCheck = useCallback(async () => {
    setChecking(true);
    const started = performance.now();
    try {
      const report = await runCheck();
      setCheck(report.domains);
      const durationMs = Math.round(performance.now() - started);
      appendValidationHistory({
        at: new Date().toISOString(),
        ok: report.ok,
        domains: report.domains,
        durationMs,
      });
      setMessage({
        type: report.ok ? "ok" : "err",
        text: report.ok ? "All checks passed." : "Validation failed.",
      });
    } catch (e) {
      setMessage({ type: "err", text: String(e) });
    } finally {
      setChecking(false);
    }
  }, []);

  const onApply = useCallback(async () => {
    setSaving(true);
    try {
      await applySlices(draft);
      setMessage({ type: "ok", text: "Saved allowlisted config files." });
      await reload();
      await onCheck();
    } catch (e) {
      setMessage({ type: "err", text: String(e) });
    } finally {
      setSaving(false);
    }
  }, [draft, reload, onCheck]);

  const onDiscard = useCallback(() => {
    setDraft(saved);
    setMessage({ type: "ok", text: "Changes discarded." });
  }, [saved]);

  const openCommandPalette = useCallback(() => {
    paletteOpener?.();
  }, [paletteOpener]);

  const setOpenCommandPalette = useCallback((fn: () => void) => {
    setPaletteOpener(() => fn);
  }, []);

  const value = useMemo(
    () => ({
      project,
      draft,
      setDraft,
      saved,
      check,
      checking,
      saving,
      dirty,
      message,
      setMessage,
      capPreview,
      onCheck,
      onApply,
      onDiscard,
      reload,
      openCommandPalette,
      setOpenCommandPalette,
    }),
    [
      project,
      draft,
      saved,
      check,
      checking,
      saving,
      dirty,
      message,
      capPreview,
      onCheck,
      onApply,
      onDiscard,
      reload,
      openCommandPalette,
      setOpenCommandPalette,
    ],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used within StudioProvider");
  return ctx;
}
