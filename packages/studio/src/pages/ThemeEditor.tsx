import { FormField } from "@/components/FormField";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ThemeConfig = {
  palette?: { light?: Record<string, string>; dark?: Record<string, string> };
  radius?: string;
  assets?: { icon: string; splash?: string };
};

type Props = {
  value: unknown;
  onChange: (v: ThemeConfig) => void;
};

function Swatch({ hsl }: { hsl: string }) {
  if (!hsl.trim()) {
    return (
      <div className="h-9 w-9 rounded-md border border-dashed border-border/50 bg-muted/30" />
    );
  }
  return (
    <div
      className="h-9 w-9 rounded-md border border-border/40 shadow-sm ring-1 ring-white/5"
      style={{ backgroundColor: `hsl(${hsl})` }}
      title={hsl}
    />
  );
}

export function ThemeEditor({ value, onChange }: Props) {
  const theme = (value ?? {
    palette: {},
    assets: { icon: "public/icon.svg" },
  }) as ThemeConfig;

  const setAsset = (key: "icon" | "splash", v: string) => {
    onChange({
      ...theme,
      assets: {
        ...theme.assets,
        icon: theme.assets?.icon ?? "public/icon.svg",
        [key]: v,
      },
    });
  };

  const setPrimary = (mode: "light" | "dark", v: string) => {
    onChange({
      ...theme,
      palette: {
        ...theme.palette,
        [mode]: { ...theme.palette?.[mode], primary: v },
      },
    });
  };

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>Icon and splash paths relative to project root</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Icon path">
              <Input
                value={theme.assets?.icon ?? ""}
                onChange={(e) => setAsset("icon", e.target.value)}
              />
            </FormField>
            <FormField label="Splash path">
              <Input
                value={theme.assets?.splash ?? ""}
                onChange={(e) => setAsset("splash", e.target.value)}
              />
            </FormField>
            <FormField label="Border radius">
              <Input
                value={theme.radius ?? "0.75rem"}
                onChange={(e) => onChange({ ...theme, radius: e.target.value })}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Primary color</CardTitle>
            <CardDescription>HSL triple format: 221 83% 53%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <Swatch hsl={theme.palette?.light?.primary ?? ""} />
              <FormField label="Light primary" className="flex-1">
                <Input
                  value={theme.palette?.light?.primary ?? ""}
                  placeholder="221 83% 53%"
                  onChange={(e) => setPrimary("light", e.target.value)}
                />
              </FormField>
            </div>
            <div className="flex items-end gap-3">
              <Swatch hsl={theme.palette?.dark?.primary ?? ""} />
              <FormField label="Dark primary" className="flex-1">
                <Input
                  value={theme.palette?.dark?.primary ?? ""}
                  placeholder="217 91% 60%"
                  onChange={(e) => setPrimary("dark", e.target.value)}
                />
              </FormField>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
