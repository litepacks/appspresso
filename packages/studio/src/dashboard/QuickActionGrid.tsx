import { Loader2, Play, Save, ShieldCheck, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onValidate: () => void;
  onSave: () => void;
  onOpenValidation: () => void;
  onOpenApply: () => void;
  checking?: boolean;
  saving?: boolean;
  dirty?: boolean;
};

export function QuickActionGrid({
  onValidate,
  onSave,
  onOpenValidation,
  onOpenApply,
  checking,
  saving,
  dirty,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Quick actions
      </p>
      <Button size="sm" className="justify-start" onClick={onValidate} disabled={checking}>
        {checking ? <Loader2 className="animate-spin" /> : <Play />}
        Run validation
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="justify-start"
        onClick={onSave}
        disabled={!dirty || saving}
      >
        {saving ? <Loader2 className="animate-spin" /> : <Save />}
        Save changes
      </Button>
      <Button size="sm" variant="ghost" className="justify-start" onClick={onOpenValidation}>
        <ShieldCheck />
        Open validation hub
      </Button>
      <Button size="sm" variant="ghost" className="justify-start" onClick={onOpenApply}>
        <Terminal />
        Apply allowlist
      </Button>
    </div>
  );
}
