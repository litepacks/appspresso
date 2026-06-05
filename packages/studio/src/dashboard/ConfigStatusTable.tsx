import type { CheckDomain, ProjectPayload } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Screen } from "@/shell/types";

const SLICES: { key: string; label: string; screen: Screen }[] = [
  { key: "routes", label: "Routes", screen: "routes" },
  { key: "flags", label: "Flags", screen: "flags" },
  { key: "theme", label: "Theme", screen: "theme" },
  { key: "envSchema", label: "Env schema", screen: "env" },
  { key: "plugins", label: "Plugins", screen: "plugins" },
  { key: "config", label: "Project config", screen: "capacitor" },
  { key: "envExample", label: ".env.example", screen: "env" },
];

const DOMAIN_BY_SLICE: Record<string, string> = {
  routes: "routes",
  flags: "flags",
  theme: "theme",
  envSchema: "env",
  envExample: "env",
  plugins: "plugins",
  config: "capacitor",
};

type Props = {
  project: ProjectPayload | null;
  check: CheckDomain[] | null;
  onNavigate: (screen: Screen) => void;
};

export function ConfigStatusTable({ project, check, onNavigate }: Props) {
  const present = project?.present ?? {};
  const domainMap = new Map(check?.map((d) => [d.domain, d]) ?? []);

  return (
    <div className="studio-panel overflow-hidden">
      <div className="border-b border-border px-4 py-2.5">
        <p className="text-xs font-semibold">Configuration status</p>
      </div>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="px-4 py-2 font-medium">Slice</th>
            <th className="px-4 py-2 font-medium">File</th>
            <th className="px-4 py-2 font-medium">Validation</th>
            <th className="px-4 py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {SLICES.map(({ key, label, screen }) => {
            const ok = present[key] === true;
            const domain = domainMap.get(DOMAIN_BY_SLICE[key] ?? "");
            const domainOk = domain?.ok;
            return (
              <tr key={key} className="border-b border-border/40 last:border-0 hover:bg-muted/10">
                <td className="px-4 py-2">{label}</td>
                <td className="px-4 py-2">
                  <Badge variant={ok ? "success" : "destructive"} dot>
                    {ok ? "present" : "missing"}
                  </Badge>
                </td>
                <td className="px-4 py-2">
                  {domain === undefined ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <Badge variant={domainOk ? "success" : "destructive"} dot>
                      {domainOk ? "pass" : `${domain.issues.length}`}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  <Button variant="ghost" size="sm" onClick={() => onNavigate(screen)}>
                    Open
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
