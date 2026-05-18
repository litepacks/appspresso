import { useAtomValue } from "jotai";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSetting, setSetting } from "@/db/sqlite";
import { sqliteStatusAtom } from "@/state/atoms";
import { flushOutbox } from "@/sync/sync.service";

export default function Database() {
  const { t } = useTranslation();
  const sqlite = useAtomValue(sqliteStatusAtom);
  const [value, setValue] = useState("poc-value");
  const [read, setRead] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("database.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            {sqlite.available
              ? "SQLite: OK"
              : sqlite.messageKey
                ? t(sqlite.messageKey)
                : t("sqlite.webUnavailable")}
          </p>
          <div className="space-y-2">
            <Label htmlFor="db-val">{t("database.setTest")}</Label>
            <Input
              id="db-val"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                await setSetting("poc_key", value);
                const v = await getSetting("poc_key");
                setRead(v);
              }}
            >
              {t("database.setTest")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void flushOutbox()}
            >
              {t("database.flushSync")}
            </Button>
          </div>
          {read !== null ? (
            <p className="text-xs text-muted-foreground">
              poc_key: <span className="font-mono">{read || "(empty)"}</span>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
