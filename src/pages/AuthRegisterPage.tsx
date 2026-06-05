import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Page } from "@/components/ui/page";
import { useState } from "react";

export default function AuthRegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn, status } = useAuth();
  const [email, setEmail] = useState("");

  return (
    <Page className="min-h-0 p-0">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">{t("auth.registerTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.registerHint")}</p>
        <Input
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          type="button"
          className="w-full"
          disabled={status === "loading"}
          onClick={() => void signIn().then(() => navigate("/", { replace: true }))}
        >
          {t("auth.registerCta")}
        </Button>
        <Link to="/auth/login" className="text-sm text-primary underline-offset-4 hover:underline">
          {t("auth.backToLogin")}
        </Link>
      </div>
    </Page>
  );
}
