import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export type BootstrapFailureScreenProps = {
  error: string;
  onRetry: () => void;
};

export function BootstrapFailureScreen({
  error,
  onRetry,
}: BootstrapFailureScreenProps) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background px-6 text-center"
      role="alert"
    >
      <h1 className="text-lg font-semibold text-foreground">
        {t("bootstrap.failedTitle", "Could not start the app")}
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t(
          "bootstrap.failedHint",
          "Something went wrong while loading. You can try again or reload the app.",
        )}
      </p>
      {import.meta.env.DEV ? (
        <pre className="max-h-32 max-w-full overflow-auto rounded-md border bg-muted/50 p-2 text-left text-xs text-muted-foreground">
          {error}
        </pre>
      ) : null}
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={onRetry}>
          {t("bootstrap.retry", "Try again")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          {t("bootstrap.reload", "Reload app")}
        </Button>
      </div>
    </div>
  );
}
