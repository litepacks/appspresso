import { Card, CardHeader, CardTitle } from "appspresso/components/ui/card";
import { List, ListItem } from "appspresso/components/ui/list";
import { Page } from "appspresso/components/ui/page";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { knownWordIdsAtom } from "../vocab/atoms";
import { SEED_WORDS } from "../vocab/seedWords";

export function DeckPage() {
  const { t } = useTranslation("demo");
  const known = useAtomValue(knownWordIdsAtom);

  return (
    <Page>
      <div>
        <h1 className="text-xl font-semibold">{t("deck.title")}</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {t("deck.subtitle")}
        </p>
      </div>
      <List>
        {SEED_WORDS.map((w) => {
          const isKnown = known.includes(w.id);
          return (
            <ListItem key={w.id}>
              <Card
                className={
                  isKnown ? "border-primary/40 bg-primary/5" : undefined
                }
              >
                <CardHeader className="flex flex-row items-baseline justify-between gap-2 p-4 py-3">
                  <CardTitle className="text-base font-medium">
                    {w.source}
                  </CardTitle>
                  <span className="shrink-0 text-muted-foreground text-sm">
                    {w.target}
                  </span>
                </CardHeader>
              </Card>
            </ListItem>
          );
        })}
      </List>
    </Page>
  );
}
