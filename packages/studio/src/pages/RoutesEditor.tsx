import { Plus, Route } from "lucide-react";
import { useState } from "react";
import { EditorItem } from "@/components/EditorItem";
import { EmptyState } from "@/components/EmptyState";
import { FormField } from "@/components/FormField";
import { PageHeader } from "@/components/PageHeader";
import { SwitchRow } from "@/components/SwitchRow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

type RouteEntry = {
  id?: string;
  path: string;
  titleKey: string;
  icon?: string;
  screen: string;
  showTabBar?: boolean;
  access?: { requiresAuth?: boolean; guestOnly?: boolean };
};

type RoutesConfig = {
  shell?: string;
  tabs?: RouteEntry[];
  stack?: RouteEntry[];
  preApp?: RouteEntry[];
};

type Props = {
  value: unknown;
  onChange: (v: RoutesConfig) => void;
};

function RouteListEditor({
  title,
  description,
  entries,
  onChange,
  showTabToggle = false,
  showAccess = false,
}: {
  title: string;
  description: string;
  entries: RouteEntry[];
  onChange: (entries: RouteEntry[]) => void;
  showTabToggle?: boolean;
  showAccess?: boolean;
}) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true });

  const toggle = (i: number) =>
    setExpanded((s) => ({ ...s, [i]: !s[i] }));

  const isExpanded = (i: number) => expanded[i] === true;

  const update = (index: number, patch: Partial<RouteEntry>) => {
    onChange(entries.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const remove = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...entries];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const add = () => {
    const nextIndex = entries.length;
    onChange([
      ...entries,
      {
        id: `route-${entries.length + 1}`,
        path: "new",
        titleKey: "app.new.title",
        icon: "home",
        screen: "./pages/HomePage",
        showTabBar: showTabToggle,
      },
    ]);
    setExpanded((s) => ({ ...s, [nextIndex]: true }));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">{description}</p>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus />
          Add
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <EmptyState
              icon={Route}
              title="No routes in this section"
              description="Add a route entry to configure navigation."
              action={
                <Button type="button" variant="outline" size="sm" onClick={add}>
                  <Plus />
                  Add route
                </Button>
              }
            />
          ) : (
            entries.map((entry, i) => (
              <EditorItem
                key={entry.id ?? `${entry.path}-${i}`}
                index={i}
                title={entry.path || "(index)"}
                subtitle={entry.screen}
                expanded={isExpanded(i)}
                onToggle={() => toggle(i)}
                onMoveUp={() => move(i, -1)}
                onMoveDown={() => move(i, 1)}
                onRemove={() => remove(i)}
                canMoveUp={i > 0}
                canMoveDown={i < entries.length - 1}
              >
                <FormField label="Path" htmlFor={`path-${i}`}>
                  <Input
                    id={`path-${i}`}
                    value={entry.path}
                    placeholder="study or empty for index"
                    onChange={(e) => update(i, { path: e.target.value })}
                  />
                </FormField>
                <FormField label="Title key" htmlFor={`title-${i}`}>
                  <Input
                    id={`title-${i}`}
                    value={entry.titleKey}
                    onChange={(e) => update(i, { titleKey: e.target.value })}
                  />
                </FormField>
                <FormField label="Icon" htmlFor={`icon-${i}`}>
                  <Input
                    id={`icon-${i}`}
                    value={entry.icon ?? ""}
                    placeholder="home"
                    onChange={(e) => update(i, { icon: e.target.value || undefined })}
                  />
                </FormField>
                <FormField label="Screen import" htmlFor={`screen-${i}`}>
                  <Input
                    id={`screen-${i}`}
                    value={entry.screen}
                    onChange={(e) => update(i, { screen: e.target.value })}
                  />
                </FormField>
                {showTabToggle ? (
                  <SwitchRow
                    id={`tabbar-${i}`}
                    label="Show tab bar"
                    checked={entry.showTabBar ?? true}
                    onCheckedChange={(v) => update(i, { showTabBar: v })}
                    className="sm:col-span-2"
                  />
                ) : null}
                {showAccess ? (
                  <>
                    <SwitchRow
                      id={`auth-${i}`}
                      label="Requires auth"
                      checked={entry.access?.requiresAuth ?? false}
                      onCheckedChange={(v) =>
                        update(i, {
                          access: {
                            ...entry.access,
                            requiresAuth: v,
                            guestOnly: v ? false : entry.access?.guestOnly,
                          },
                        })
                      }
                    />
                    <SwitchRow
                      id={`guest-${i}`}
                      label="Guest only"
                      checked={entry.access?.guestOnly ?? false}
                      onCheckedChange={(v) =>
                        update(i, {
                          access: {
                            ...entry.access,
                            guestOnly: v,
                            requiresAuth: v ? false : entry.access?.requiresAuth,
                          },
                        })
                      }
                    />
                  </>
                ) : null}
              </EditorItem>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function RoutesEditor({ value, onChange }: Props) {
  const config = (value ?? {
    shell: "bottomTabs",
    tabs: [],
    stack: [],
    preApp: [],
  }) as RoutesConfig;

  return (
    <div className="space-y-3">
      <PageHeader
        title="Routes"
        description="appspresso.routes.ts"
        toolbar={
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Shell</span>
            <Select
              value={config.shell ?? "bottomTabs"}
              onValueChange={(shell) => onChange({ ...config, shell })}
            >
              <SelectTrigger className="h-8 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottomTabs">Bottom tabs</SelectItem>
                <SelectItem value="stack">Stack</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Tabs defaultValue="tabs" className="space-y-3">
        <TabsList>
          <TabsTrigger value="tabs">Tabs ({config.tabs?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="stack">Stack ({config.stack?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="preApp">Pre-app ({config.preApp?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="tabs">
          <RouteListEditor
            title="Tab routes"
            description="Bottom tab bar routes"
            entries={config.tabs ?? []}
            showTabToggle
            onChange={(tabs) => onChange({ ...config, tabs })}
          />
        </TabsContent>
        <TabsContent value="stack">
          <RouteListEditor
            title="Stack routes"
            description="Routes without tab entries"
            entries={config.stack ?? []}
            onChange={(stack) => onChange({ ...config, stack })}
          />
        </TabsContent>
        <TabsContent value="preApp">
          <RouteListEditor
            title="Pre-app routes"
            description="Auth and onboarding gates"
            entries={config.preApp ?? []}
            showAccess
            onChange={(preApp) => onChange({ ...config, preApp })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
