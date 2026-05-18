import { Badge } from "appspresso/components/ui/badge";
import { Button } from "appspresso/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "appspresso/components/ui/card";
import { List, ListItem } from "appspresso/components/ui/list";
import { Page } from "appspresso/components/ui/page";
import { appspressoGradientTextClass } from "appspresso/lib/gradient";
import { cn } from "appspresso/lib/utils";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { knownWordIdsAtom, studyPassCountAtom } from "../vocab/atoms";
import { SEED_WORDS } from "../vocab/seedWords";

export function VocabHomePage() {
  const { t } = useTranslation("demo");
  const known = useAtomValue(knownWordIdsAtom);
  const passCount = useAtomValue(studyPassCountAtom);
  const total = SEED_WORDS.length;

  return (
    <Page>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className={cn("text-base", appspressoGradientTextClass())}>
            {t("app.home.statsTitle")}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {t("app.home.statsDesc")}
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm">
          <List
            gap="none"
            className="divide-y divide-border/60 rounded-xl border border-border/60 bg-muted/15 px-3"
          >
            <ListItem className="flex items-center justify-between gap-3 py-3">
              <span className="text-foreground">
                {t("app.home.statRowDeck")}
              </span>
              <Badge variant="secondary" size="default">
                {total}
              </Badge>
            </ListItem>
            <ListItem className="flex items-center justify-between gap-3 py-3">
              <span className="text-foreground">
                {t("app.home.statRowKnown")}
              </span>
              <Badge variant={known.length > 0 ? "default" : "muted"}>
                {known.length}
              </Badge>
            </ListItem>
            <ListItem className="flex items-center justify-between gap-3 py-3">
              <span className="text-foreground">
                {t("app.home.statRowPasses")}
              </span>
              <Badge variant="outline">{passCount}</Badge>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Button to="/study" linkComponent={Link} className="w-full">
        {t("app.home.ctaStudy")}
      </Button>
      <Button
        to="/deck"
        linkComponent={Link}
        variant="outline"
        className="w-full"
      >
        {t("app.home.ctaDeck")}
      </Button>
      <Button
        to="/match"
        linkComponent={Link}
        variant="secondary"
        className="w-full"
      >
        {t("app.home.ctaMatch")}
      </Button>
    </Page>
  );
}
