import { useSetAtom } from "jotai";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { onboardingSteps } from "@/app/onboarding.config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasCompletedOnboardingAtom } from "@/state/atoms";

export default function OnboardingPage() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const setDone = useSetAtom(hasCompletedOnboardingAtom);
  const step = onboardingSteps[index];
  const total = onboardingSteps.length;

  const finish = () => setDone(true);
  const next = () => {
    if (index >= total - 1) finish();
    else setIndex((i) => i + 1);
  };
  const back = () => setIndex((i) => Math.max(0, i - 1));

  if (!step) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(step.titleKey)}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {t("onboarding.progress", { current: index + 1, total })}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {t(step.descriptionKey)}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={back}
            disabled={index === 0}
          >
            {t("onboarding.back")}
          </Button>
          {step.skippable ? (
            <Button type="button" variant="ghost" size="sm" onClick={finish}>
              {t("onboarding.skip")}
            </Button>
          ) : null}
        </div>
        <Button type="button" size="sm" onClick={next}>
          {index >= total - 1 ? t("onboarding.finish") : t("onboarding.next")}
        </Button>
      </CardFooter>
    </Card>
  );
}
