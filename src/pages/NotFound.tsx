import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-xl font-semibold">{t("nav.notFound")}</h1>
      <Button type="button" asChild>
        <Link to="/">{t("nav.home")}</Link>
      </Button>
    </div>
  );
}
