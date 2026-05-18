import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scheduleTestNotification } from "@/services/local-notification.service";

const items = [
  {
    id: "1",
    title: "Demo local notification",
    body: "Tap opens detail route in a real app.",
  },
  { id: "2", title: "Queued sync item", body: "Outbox demo from Home tab." },
];

export default function Notifications() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t("notifications.title")}</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              void scheduleTestNotification(
                t("notifications.title"),
                "POC local notification",
              )
            }
          >
            {t("notifications.scheduleLocal")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((it) => (
            <Link
              key={it.id}
              to={`/notifications/detail?id=${encodeURIComponent(it.id)}`}
              className="block rounded-lg border p-3 transition-colors hover:bg-muted/60"
            >
              <div className="font-medium">{it.title}</div>
              <div className="text-sm text-muted-foreground">{it.body}</div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
