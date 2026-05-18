import { BugAntIcon } from "@heroicons/react/24/outline";
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

export function DebugPanel() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [confirmNuclear, setConfirmNuclear] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const info = getDebugBuildInfo();

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
            <div className="rounded-lg border p-3">
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
