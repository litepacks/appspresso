import { sqliteStatusAtom } from "appspresso/state/atoms";
import { appStore } from "appspresso/state/store";
import { useAtom, useAtomValue } from "jotai";
import { type ReactNode, useEffect, useLayoutEffect, useState } from "react";
import { knownWordIdsAtom, studyIndexAtom, studyPassCountAtom } from "./atoms";

/** `app_settings` key; persists in native SQLite, same key in localStorage on web. */
export const VOCAB_STUDY_STORAGE_KEY = "demo_vocab_study_v1";

export type VocabStudyPersisted = {
  studyIndex: number;
  knownWordIds: string[];
  studyPassCount: number;
};

function parsePersisted(raw: string | null): VocabStudyPersisted | null {
  if (raw == null || raw === "") return null;
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return null;
    const studyIndex = (o as { studyIndex?: unknown }).studyIndex;
    const knownWordIds = (o as { knownWordIds?: unknown }).knownWordIds;
    const studyPassCount = (o as { studyPassCount?: unknown }).studyPassCount;
    if (typeof studyIndex !== "number" || !Number.isFinite(studyIndex)) {
      return null;
    }
    if (
      typeof studyPassCount !== "number" ||
      !Number.isFinite(studyPassCount)
    ) {
      return null;
    }
    if (
      !Array.isArray(knownWordIds) ||
      !knownWordIds.every((x) => typeof x === "string")
    ) {
      return null;
    }
    return {
      studyIndex: Math.max(0, Math.floor(studyIndex)),
      knownWordIds,
      studyPassCount: Math.max(0, Math.floor(studyPassCount)),
    };
  } catch {
    return null;
  }
}

function readWebPersisted(): VocabStudyPersisted | null {
  if (typeof localStorage === "undefined") return null;
  return parsePersisted(localStorage.getItem(VOCAB_STUDY_STORAGE_KEY));
}

function writeWebPersisted(payload: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(VOCAB_STUDY_STORAGE_KEY, payload);
  } catch {
    /* quota / private mode */
  }
}

/**
 * Persists study word index, known ids, and pass count to SQLite via `app_settings` on native;
 * on web builds keeps the same JSON in localStorage.
 */
export function VocabStudyPersistence({ children }: { children: ReactNode }) {
  const [sqlite] = useAtom(sqliteStatusAtom);
  const [hydrated, setHydrated] = useState(false);
  const index = useAtomValue(studyIndexAtom);
  const known = useAtomValue(knownWordIdsAtom);
  const passCount = useAtomValue(studyPassCountAtom);

  useLayoutEffect(() => {
    if (sqlite.messageKey !== "sqlite.webUnavailable") return;
    const p = readWebPersisted();
    if (p) {
      appStore.set(studyIndexAtom, p.studyIndex);
      appStore.set(knownWordIdsAtom, p.knownWordIds);
      appStore.set(studyPassCountAtom, p.studyPassCount);
    }
    setHydrated(true);
  }, [sqlite.messageKey]);

  useEffect(() => {
    if (sqlite.available) {
      let cancelled = false;
      void (async () => {
        const { getSetting } = await import("appspresso/db/sqlite");
        const raw = await getSetting(VOCAB_STUDY_STORAGE_KEY);
        const p = parsePersisted(raw);
        if (cancelled) return;
        if (p) {
          appStore.set(studyIndexAtom, p.studyIndex);
          appStore.set(knownWordIdsAtom, p.knownWordIds);
          appStore.set(studyPassCountAtom, p.studyPassCount);
        }
        setHydrated(true);
      })();
      return () => {
        cancelled = true;
      };
    }

    if (sqlite.messageKey !== "sqlite.webUnavailable") {
      setHydrated(true);
    }
    return undefined;
  }, [sqlite.available, sqlite.messageKey]);

  useEffect(() => {
    if (!hydrated) return;
    const payload = JSON.stringify({
      studyIndex: index,
      knownWordIds: known,
      studyPassCount: passCount,
    } satisfies VocabStudyPersisted);
    if (sqlite.available) {
      void import("appspresso/db/sqlite").then(({ setSetting }) =>
        setSetting(VOCAB_STUDY_STORAGE_KEY, payload),
      );
    } else if (sqlite.messageKey === "sqlite.webUnavailable") {
      writeWebPersisted(payload);
    }
  }, [hydrated, sqlite.available, sqlite.messageKey, index, known, passCount]);

  if (!hydrated) {
    return null;
  }

  return <>{children}</>;
}
