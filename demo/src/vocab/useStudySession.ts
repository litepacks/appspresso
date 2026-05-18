import { useAtom, useSetAtom } from "jotai";
import { useCallback, useMemo } from "react";
import { knownWordIdsAtom, studyIndexAtom, studyPassCountAtom } from "./atoms";
import { SEED_WORDS } from "./seedWords";
import type { VocabWord } from "./types";

export function useStudySession() {
  const [index, setIndex] = useAtom(studyIndexAtom);
  const setKnown = useSetAtom(knownWordIdsAtom);
  const setPassCount = useSetAtom(studyPassCountAtom);

  const words = useMemo(() => [...SEED_WORDS], []);

  const current: VocabWord | undefined = useMemo(() => {
    if (words.length === 0) return undefined;
    return words[index % words.length] as VocabWord;
  }, [words, index]);

  const next = useCallback(() => {
    setIndex((i) => i + 1);
    setPassCount((c) => c + 1);
  }, [setIndex, setPassCount]);

  const markKnown = useCallback(
    (id: string) => {
      setKnown((prev) => (prev.includes(id) ? prev : [...prev, id]));
      next();
    },
    [setKnown, next],
  );

  const jumpToStart = useCallback(() => {
    setIndex(0);
  }, [setIndex]);

  return {
    words,
    current,
    index,
    next,
    markKnown,
    jumpToStart,
  };
}
