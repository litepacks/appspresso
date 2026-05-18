import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/ui/page";

export default function AuthLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn, signOut, status } = useAuth();

  if (status === "signedIn") {
    return (
      <Page className="min-h-0 p-0">
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">{t("auth.loginTitle")}</h1>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {t("auth.alreadySignedIn")}
            </p>
          </div>
          <Button type="button" variant="secondary" className="w-full" asChild>
            <Link to="/" replace>
              {t("auth.goHome")}
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => void signOut()}
          >
            {t("settings.signOut")}
          </Button>
        </div>
      </Page>
    );
  }

  return (
    <Page className="min-h-0 p-0">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">{t("auth.loginTitle")}</h1>
          <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
            {t("auth.loginHint")}
          </p>
        </div>
        <Button
          type="button"
          className="w-full"
          disabled={status === "loading"}
          onClick={() => {
            void signIn().then(() => navigate("/", { replace: true }));
          }}
        >
          {t("auth.signInCta")}
        </Button>
      </div>
    </Page>
  );
}
