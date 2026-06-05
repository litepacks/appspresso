import { Badge } from "@/components/ui/badge";

const ALLOWLIST = [
  "appspresso.routes.ts",
  "appspresso.flags.ts",
  "appspresso.theme.ts",
  "appspresso.env.schema.ts",
  ".env.example",
];

type Props = {
  changedDomains: string[];
  hasUnsavedChanges: boolean;
};

export function ChangedFilesList({ changedDomains, hasUnsavedChanges }: Props) {
  if (!hasUnsavedChanges) {
    return (
      <div className="studio-panel p-4">
        <p className="text-xs font-semibold">Unsaved changes</p>
        <p className="mt-1 text-xs text-muted-foreground">No pending edits.</p>
      </div>
    );
  }

  return (
    <div className="studio-panel overflow-hidden">
      <div className="border-b border-border px-4 py-2.5">
        <p className="text-xs font-semibold">Unsaved changes</p>
        <p className="text-[11px] text-muted-foreground">
          Domains: {changedDomains.join(", ") || "config"}
        </p>
      </div>
      <ul className="divide-y divide-border/40">
        {ALLOWLIST.map((file) => (
          <li key={file} className="flex items-center justify-between px-4 py-2 text-xs">
            <code className="font-mono text-[11px]">{file}</code>
            <Badge variant="warning" dot>
              pending
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
