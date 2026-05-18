import { atom } from "jotai";

/** Active word index in the study session (wraps with modulo). */
export const studyIndexAtom = atom(0);

/** Word ids the user marked as known. */
export const knownWordIdsAtom = atom<string[]>([]);

/** Number of cards advanced at least once in the session (stats). */
export const studyPassCountAtom = atom(0);
