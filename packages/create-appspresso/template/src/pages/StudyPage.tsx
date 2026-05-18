import { Button } from "appspresso/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "appspresso/components/ui/card";
import { Page } from "appspresso/components/ui/page";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useStudySession } from "../vocab/useStudySession";

export function StudyPage() {
  const { t } = useTranslation("demo");
  const { current, next, markKnown } = useStudySession();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, []);

  if (current == null) {
    return <p className="text-muted-foreground text-sm">{t("study.empty")}</p>;
  }

  const onNext = () => {
    setRevealed(false);
    next();
  };

  return (
    <Page>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">{t("study.title")}</h1>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="self-start sm:self-auto"
        >
          <Link to="/match">{t("study.matchLink")}</Link>
        </Button>
      </div>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            {t("study.sourceLabel")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <button
            type="button"
            className="w-full rounded-2xl border-0 bg-muted/50 py-8 text-center text-2xl font-bold tracking-tight shadow-sm transition-colors hover:bg-muted"
            onClick={() => setRevealed(true)}
          >
            {current.source}
          </button>
          {revealed ? (
            <p className="mt-4 border-border border-t pt-4 text-center text-foreground text-lg">
              {current.target}
            </p>
          ) : (
            <p className="mt-3 text-center text-muted-foreground text-xs">
              {t("study.tapHint")}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 p-4 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:flex-1"
            onClick={onNext}
          >
            {t("study.next")}
          </Button>
          <Button
            type="button"
            className="w-full sm:flex-1"
            onClick={() => markKnown(current.id)}
          >
            {t("study.known")}
          </Button>
        </CardFooter>
      </Card>
    </Page>
  );
}
