import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  dirty: boolean;
  saving?: boolean;
  onSave: () => void;
  onDiscard: () => void;
};

export function StatusBar({ dirty, saving, onSave, onDiscard }: Props) {
  if (!dirty) return null;

  return (
    <div className="studio-status-bar">
      <p className="text-xs text-muted-foreground">Unsaved changes</p>
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="sm" onClick={onDiscard} disabled={saving}>
          <X />
          Discard
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          Save
        </Button>
      </div>
    </div>
  );
}
