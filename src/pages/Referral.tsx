import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Referral() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const code = params.get("code");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("referral.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>Deep link example: myapp://referral?code=DEMO</p>
        {code ? (
          <p>
            code: <span className="font-mono text-foreground">{code}</span>
          </p>
        ) : (
          <p>No query parameter.</p>
        )}
      </CardContent>
    </Card>
  );
}
