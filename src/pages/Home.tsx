import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { http } from "@/api/http";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { refreshDeviceInfo } from "@/services/device.service";
import { refreshNetworkStatus } from "@/services/network.service";
import {
  appInfoAtom,
  appLifecycleAtom,
  deviceInfoAtom,
  networkStatusAtom,
  sqliteStatusAtom,
  syncStatusAtom,
} from "@/state/atoms";
import { enqueueMutationLikeOperation } from "@/sync/sync.service";

export default function Home() {
  const { t } = useTranslation();
  const device = useAtomValue(deviceInfoAtom);
  const network = useAtomValue(networkStatusAtom);
  const life = useAtomValue(appLifecycleAtom);
  const sync = useAtomValue(syncStatusAtom);
  const sqlite = useAtomValue(sqliteStatusAtom);
  const info = useAtomValue(appInfoAtom);

  const demoQuery = useQuery({
    queryKey: ["demo-http-todo"],
    queryFn: async () => {
      const { data } = await http.get<{ title?: string }>(
        "https://jsonplaceholder.typicode.com/todos/1",
      );
      return data;
    },
    enabled: false,
  });

  useEffect(() => {
    void refreshDeviceInfo();
    void refreshNetworkStatus();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("app.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">app version:</span>{" "}
            {info.version}
          </div>
          <p className="text-muted-foreground text-xs">
            {t("home.localeNote")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("home.device")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div>
            {device.platform} {device.model ? `· ${device.model}` : ""}
          </div>
          {device.osVersion ? (
            <div className="text-muted-foreground">{device.osVersion}</div>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refreshDeviceInfo()}
          >
            {t("home.nativeTest")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("home.network")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div>
            {network.connected ? "online" : "offline"} ·{" "}
            {network.connectionType}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refreshNetworkStatus()}
          >
            {t("home.nativeTest")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("home.lifecycle")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {life.state} ({life.source})
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("home.sync")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            pending: {sync.pendingCount} {sync.isFlushing ? "(flushing)" : ""}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              enqueueMutationLikeOperation({
                operation: "demo.enqueue",
                payload: { at: new Date().toISOString() },
              })
            }
          >
            Enqueue demo mutation
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("home.sqlite")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {sqlite.available
            ? "ready"
            : sqlite.messageKey
              ? t(sqlite.messageKey)
              : t("sqlite.webUnavailable")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HTTP + Query</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Button
            type="button"
            size="sm"
            onClick={() => void demoQuery.refetch()}
          >
            {t("home.httpProbe")}
          </Button>
          {demoQuery.data?.title ? (
            <p className="text-muted-foreground">{demoQuery.data.title}</p>
          ) : null}
          {demoQuery.isError ? (
            <p className="text-destructive">failed</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
