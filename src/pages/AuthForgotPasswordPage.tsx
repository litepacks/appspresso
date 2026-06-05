import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Page } from "@/components/ui/page";
import { useState } from "react";

export default function AuthForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <Page className="min-h-0 p-0">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">{t("auth.forgotTitle")}</h1>
        {sent ? (
          <p className="text-sm text-muted-foreground">{t("auth.forgotSent")}</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{t("auth.forgotHint")}</p>
            <Input
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="button"
              className="w-full"
              onClick={() => setSent(true)}
            >
              {t("auth.forgotCta")}
            </Button>
          </>
        )}
        <Link to="/auth/login" className="text-sm text-primary underline-offset-4 hover:underline">
          {t("auth.backToLogin")}
        </Link>
      </div>
    </Page>
  );
}
