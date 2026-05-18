import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const detailMap: Record<string, { title: string; body: string }> = {
  "1": {
    title: "Demo local notification",
    body: "Detail view — in production you would bind the push payload and related metadata here.",
  },
  "2": {
    title: "Queued sync item",
    body: "Example copy for an outbox / offline item.",
  },
};

export default function NotificationDetail() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const id = params.get("id") ?? "";
  const row = detailMap[id];

  return (
    <div className="space-y-4">
      <Button type="button" variant="ghost" size="sm" asChild>
        <Link to="/notifications">{t("common.back")}</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{t("notifications.detailTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            id: <span className="font-mono text-foreground">{id || "—"}</span>
          </p>
          {row ? (
            <>
              <p className="font-medium">{row.title}</p>
              <p className="text-muted-foreground">{row.body}</p>
            </>
          ) : (
            <p className="text-muted-foreground">No record found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
