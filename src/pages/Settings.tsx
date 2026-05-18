import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ThemePreference } from "@/config/types";
import { hasCompletedOnboardingAtom, themePreferenceAtom } from "@/state/atoms";

export default function Settings() {
  const { t } = useTranslation();
  const auth = useAuth();
  const [pref, setPref] = useAtom(themePreferenceAtom);
  const [, setOnboardingDone] = useAtom(hasCompletedOnboardingAtom);

  const onTheme = (v: ThemePreference) => setPref(v);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.theme")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={pref}
            onValueChange={(v) => onTheme(v as ThemePreference)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="system">
                {t("settings.theme_system")}
              </TabsTrigger>
              <TabsTrigger value="light">
                {t("settings.theme_light")}
              </TabsTrigger>
              <TabsTrigger value="dark">{t("settings.theme_dark")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.auth")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">status: {auth.status}</p>
          {auth.status === "signedOut" ? (
            <Link
              to="/auth/login"
              className="text-primary text-sm font-medium underline-offset-4 hover:underline"
            >
              {t("settings.loginScreenLink")}
            </Link>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => void auth.signIn()}>
              {t("settings.signIn")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void auth.signOut()}
            >
              {t("settings.signOut")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.resetOnboarding")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOnboardingDone(false)}
          >
            {t("settings.resetOnboarding")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
