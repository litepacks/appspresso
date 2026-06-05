import { BugAntIcon } from "@heroicons/react/24/outline";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  clearTanstackQueryCache,
  clearWebOutbox,
  getDebugBuildInfo,
  nuclearResetLocalState,
  resetOnboardingFlag,
} from "@/dev/debug-actions";
import { getSyncLogs } from "@/sync/log";
import { listUnresolvedConflicts } from "@/sync/conflicts";
import { listOutboxJobs } from "@/sync/outbox/api";
import { flushOutbox } from "@/sync/sync.service";
import {
  bootstrapStatusAtom,
  networkStatusAtom,
  sqliteStatusAtom,
  syncStatusAtom,
} from "@/state/atoms";

export function DebugPanel() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [confirmNuclear, setConfirmNuclear] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [outboxPreview, setOutboxPreview] = useState<string>("");
  const [conflictPreview, setConflictPreview] = useState<string>("");
  const info = getDebugBuildInfo();
  const bootstrap = useAtomValue(bootstrapStatusAtom);
  const network = useAtomValue(networkStatusAtom);
  const sync = useAtomValue(syncStatusAtom);
  const sqlite = useAtomValue(sqliteStatusAtom);

  const run = async (label: string, fn: () => Promise<void> | void) => {
    setStatus(null);
    try {
      await fn();
      setStatus(label);
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="fixed bottom-24 right-4 z-50 h-11 w-11 rounded-full shadow-md md:bottom-8"
            aria-label={t("debug.open")}
          >
            <BugAntIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{t("debug.title")}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4 text-sm">
            <div className="rounded-lg border p-3 space-y-1">
              <div>
                <span className="text-muted-foreground">
                  {t("debug.build")}:
                </span>{" "}
                {info.version}
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("debug.platform")}:
                </span>{" "}
                {info.platform} {info.isNative ? "(native)" : "(web)"}
              </div>
              <div>
                <span className="text-muted-foreground">Bootstrap:</span>{" "}
                {bootstrap.phase}
                {bootstrap.phase === "failed" ? ` — ${bootstrap.error}` : ""}
              </div>
              <div>
                <span className="text-muted-foreground">Network:</span>{" "}
                {network.connected ? "online" : "offline"} (
                {network.connectionType})
              </div>
              <div>
                <span className="text-muted-foreground">Sync pending:</span>{" "}
                {sync.pendingCount}
                {sync.deadCount != null ? ` · dead: ${sync.deadCount}` : ""}
                {sync.healthScore != null
                  ? ` · health: ${sync.healthScore}`
                  : ""}
                {sync.pausedReason ? ` · paused: ${sync.pausedReason}` : ""}
                {sync.lastError ? ` — ${sync.lastError}` : ""}
              </div>
              <div>
                <span className="text-muted-foreground">SQLite:</span>{" "}
                {sqlite.available ? "open" : "unavailable"}
                {sqlite.messageKey ? ` (${sqlite.messageKey})` : ""}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void run("query", clearTanstackQueryCache)}
              >
                {t("debug.clearQuery")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void run("flush", flushOutbox)}
              >
                Sync flush
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void run("outbox-list", async () => {
                    const jobs = await listOutboxJobs(undefined, 10);
                    setOutboxPreview(
                      jobs.length
                        ? jobs
                            .map(
                              (j) =>
                                `#${j.id} ${j.status} ${j.action} ${j.entityType}`,
                            )
                            .join("\n")
                        : "(empty)",
                    );
                  })
                }
              >
                Outbox list
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void run("conflicts", async () => {
                    const rows = await listUnresolvedConflicts(10);
                    setConflictPreview(
                      rows.length
                        ? rows
                            .map((c) => `#${c.id} ${c.entityType}/${c.entityLocalId}`)
                            .join("\n")
                        : "(none)",
                    );
                  })
                }
              >
                Conflicts
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => run("outbox", clearWebOutbox)}
              >
                {t("debug.clearOutbox")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => run("onboarding", resetOnboardingFlag)}
              >
                {t("debug.resetOnboarding")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setConfirmNuclear(true)}
              >
                {t("debug.nuclear")}
              </Button>
            </div>
            {outboxPreview ? (
              <pre className="text-xs whitespace-pre-wrap rounded border p-2 max-h-32 overflow-auto">
                {outboxPreview}
              </pre>
            ) : null}
            {conflictPreview ? (
              <pre className="text-xs whitespace-pre-wrap rounded border p-2 max-h-32 overflow-auto">
                {conflictPreview}
              </pre>
            ) : null}
            {import.meta.env.DEV ? (
              <pre className="text-xs whitespace-pre-wrap rounded border p-2 max-h-24 overflow-auto text-muted-foreground">
                {getSyncLogs(5)
                  .map((e) => `${e.event}`)
                  .join("\n") || "no sync logs"}
              </pre>
            ) : null}
            {status ? (
              <p className="text-xs text-muted-foreground">
                {t("debug.done")}: {status}
              </p>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmNuclear} onOpenChange={setConfirmNuclear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("debug.nuclear")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("debug.nuclearConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">
              {t("common.back")}
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={() => {
                void (async () => {
                  await nuclearResetLocalState();
                  setConfirmNuclear(false);
                  setOpen(false);
                })();
              }}
            >
              {t("debug.nuclear")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
