import { useTranslation } from "react-i18next";

export function LoadingFallback() {
  const { t } = useTranslation();
  return (
    <div className="app-shell flex min-h-dvh items-center justify-center">
      <p className="text-muted-foreground">{t("app.loading")}</p>
    </div>
  );
}
