/** Single word card; `deckId` / `tags` may be added later. */
export type VocabWord = {
  id: string;
  /** Language being learned (e.g. English) */
  source: string;
  /** Native-language translation (e.g. Turkish) */
  target: string;
  /** Optional hint */
  hint?: string;
};
