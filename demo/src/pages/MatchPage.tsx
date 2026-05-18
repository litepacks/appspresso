import { Button } from "appspresso/components/ui/button";
import { Page } from "appspresso/components/ui/page";
import { Stack } from "appspresso/components/ui/stack";
import { cn } from "appspresso/lib/utils";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { SEED_WORDS } from "../vocab/seedWords";
import type { VocabWord } from "../vocab/types";

const PAIR_COUNT = 6;

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickBatch(all: readonly VocabWord[], count: number): VocabWord[] {
  const n = Math.min(count, all.length);
  return shuffle(all).slice(0, n);
}

type RoundLayout = {
  batch: VocabWord[];
  leftOrder: VocabWord[];
  rightOrder: VocabWord[];
};

function newRound(): RoundLayout {
  const batch = pickBatch(SEED_WORDS, PAIR_COUNT);
  return {
    batch,
    leftOrder: shuffle(batch),
    rightOrder: shuffle(batch),
  };
}

export function MatchPage() {
  const { t } = useTranslation("demo");
  const [layout, setLayout] = useState<RoundLayout>(() => newRound());
  const [matched, setMatched] = useState<Set<string>>(() => new Set());
  const [leftPick, setLeftPick] = useState<string | null>(null);
  const [rightPick, setRightPick] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<Set<string>>(() => new Set());

  const { batch, leftOrder, rightOrder } = layout;

  const resetPicks = useCallback(() => {
    setLeftPick(null);
    setRightPick(null);
    setWrongIds(new Set());
  }, []);

  const nextRound = useCallback(() => {
    setLayout(newRound());
    setMatched(new Set());
    resetPicks();
  }, [resetPicks]);

  const tryResolve = useCallback(
    (leftId: string | null, rightId: string | null) => {
      if (leftId == null || rightId == null) return;
      if (leftId === rightId) {
        setMatched((prev) => new Set(prev).add(leftId));
        resetPicks();
        return;
      }
      setWrongIds(new Set([leftId, rightId]));
      window.setTimeout(() => {
        resetPicks();
      }, 450);
    },
    [resetPicks],
  );

  const onPickLeft = useCallback(
    (id: string) => {
      if (matched.has(id)) return;
      setWrongIds(new Set());
      if (leftPick === id) {
        setLeftPick(null);
        return;
      }
      setLeftPick(id);
      if (rightPick !== null) tryResolve(id, rightPick);
    },
    [leftPick, matched, rightPick, tryResolve],
  );

  const onPickRight = useCallback(
    (id: string) => {
      if (matched.has(id)) return;
      setWrongIds(new Set());
      if (rightPick === id) {
        setRightPick(null);
        return;
      }
      setRightPick(id);
      if (leftPick !== null) tryResolve(leftPick, id);
    },
    [leftPick, matched, rightPick, tryResolve],
  );

  const remaining = batch.filter((w) => !matched.has(w.id));
  const roundDone = batch.length > 0 && remaining.length === 0;

  if (SEED_WORDS.length < 2) {
    return (
      <p className="text-muted-foreground text-sm">{t("match.needMore")}</p>
    );
  }

  return (
    <Page maxWidth="2xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{t("match.title")}</h1>
        <Button
          to="/study"
          linkComponent={Link}
          variant="ghost"
          size="sm"
          className="shrink-0"
        >
          {t("match.backStudy")}
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">{t("match.subtitle")}</p>

      {roundDone ? (
        <div className="rounded-2xl border-0 bg-card p-6 text-center shadow-card">
          <p className="font-medium">{t("match.complete")}</p>
          <Button type="button" className="mt-4" onClick={nextRound}>
            {t("match.nextRound")}
          </Button>
        </div>
      ) : (
        <Stack
          direction="row"
          align="stretch"
          gap="md"
          className="w-full min-w-0 sm:gap-6"
        >
          <section className="min-w-0 flex-1" aria-label={t("match.colSource")}>
            <Stack direction="col" gap="sm">
              <p className="text-center text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                {t("match.colSource")}
              </p>
              <ul className="flex flex-col gap-2">
                {leftOrder.map((w) => {
                  if (matched.has(w.id)) return null;
                  const active = leftPick === w.id;
                  const wrong = wrongIds.has(w.id);
                  return (
                    <li key={w.id}>
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => onPickLeft(w.id)}
                        className={cn(
                          "w-full rounded-2xl border px-2 py-2.5 text-center text-sm font-medium leading-snug transition-all sm:px-3 sm:py-3",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active &&
                            "border-primary bg-primary/10 text-primary ring-2 ring-primary/30",
                          !active &&
                            !wrong &&
                            "border-border bg-card hover:bg-accent/50",
                          wrong &&
                            "animate-pulse border-destructive bg-destructive/10",
                        )}
                      >
                        {w.source}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Stack>
          </section>
          <section className="min-w-0 flex-1" aria-label={t("match.colTarget")}>
            <Stack direction="col" gap="sm">
              <p className="text-center text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                {t("match.colTarget")}
              </p>
              <ul className="flex flex-col gap-2">
                {rightOrder.map((w) => {
                  if (matched.has(w.id)) return null;
                  const active = rightPick === w.id;
                  const wrong = wrongIds.has(w.id);
                  return (
                    <li key={`r-${w.id}`}>
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => onPickRight(w.id)}
                        className={cn(
                          "w-full rounded-2xl border px-2 py-2.5 text-center text-sm font-medium leading-snug transition-all sm:px-3 sm:py-3",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active &&
                            "border-primary bg-primary/10 text-primary ring-2 ring-primary/30",
                          !active &&
                            !wrong &&
                            "border-border bg-card hover:bg-accent/50",
                          wrong &&
                            "animate-pulse border-destructive bg-destructive/10",
                        )}
                      >
                        {w.target}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Stack>
          </section>
        </Stack>
      )}

      {!roundDone ? (
        <p className="text-center text-muted-foreground text-xs">
          {t("match.progress", {
            done: matched.size,
            total: batch.length,
          })}
        </p>
      ) : null}
    </Page>
  );
}
