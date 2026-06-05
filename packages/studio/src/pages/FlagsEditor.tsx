import { Flag, Plus } from "lucide-react";
import { useState } from "react";
import { EditorItem } from "@/components/EditorItem";
import { EmptyState } from "@/components/EmptyState";
import { FormField } from "@/components/FormField";
import { PageHeader } from "@/components/PageHeader";
import { SwitchRow } from "@/components/SwitchRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FlagDef = {
  default: boolean;
  description: string;
  owner?: string;
  envKey?: string;
};

type Props = {
  value: unknown;
  onChange: (v: Record<string, FlagDef>) => void;
};

export function FlagsEditor({ value, onChange }: Props) {
  const flags = (value ?? {}) as Record<string, FlagDef>;
  const entries = Object.entries(flags);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setExpanded((s) => ({ ...s, [key]: !s[key] }));

  const isExpanded = (key: string) => expanded[key] === true;

  const update = (key: string, patch: Partial<FlagDef>) => {
    onChange({ ...flags, [key]: { ...flags[key], ...patch } });
  };

  const remove = (key: string) => {
    const next = { ...flags };
    delete next[key];
    onChange(next);
  };

  const addFlag = () => {
    const key = `feature${entries.length + 1}`;
    onChange({
      ...flags,
      [key]: { default: false, description: "Describe this flag" },
    });
    setExpanded((s) => ({ ...s, [key]: true }));
  };

  return (
    <div>
      <PageHeader
        title="Feature Flags"
        description="Registry defaults merge before VITE_FEATURE_FLAGS and optional remote URL."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={addFlag}>
            <Plus />
            Add flag
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Flag registry</CardTitle>
          <CardDescription>
            {entries.length} flag{entries.length === 1 ? "" : "s"} defined
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <EmptyState
              icon={Flag}
              title="No flags defined"
              description="Add feature flags with defaults and optional env key overrides."
              action={
                <Button type="button" variant="outline" size="sm" onClick={addFlag}>
                  <Plus />
                  Add flag
                </Button>
              }
            />
          ) : (
            entries.map(([key, def]) => (
              <EditorItem
                key={key}
                title={key}
                subtitle={def.description}
                expanded={isExpanded(key)}
                onToggle={() => toggle(key)}
                onRemove={() => remove(key)}
                badges={
                  <Badge variant={def.default ? "success" : "secondary"} dot>
                    {def.default ? "on" : "off"}
                  </Badge>
                }
              >
                <FormField label="Description">
                  <Input
                    value={def.description}
                    onChange={(e) => update(key, { description: e.target.value })}
                  />
                </FormField>
                <FormField label="Owner" hint="Optional team or person">
                  <Input
                    value={def.owner ?? ""}
                    onChange={(e) => update(key, { owner: e.target.value || undefined })}
                  />
                </FormField>
                <FormField label="Env key" hint="Maps to VITE_* when set">
                  <Input
                    value={def.envKey ?? ""}
                    placeholder="VITE_ENABLE_DEBUG_PANEL"
                    onChange={(e) => update(key, { envKey: e.target.value || undefined })}
                  />
                </FormField>
                <SwitchRow
                  id={`default-${key}`}
                  label="Default enabled"
                  checked={def.default}
                  onCheckedChange={(v) => update(key, { default: v })}
                />
              </EditorItem>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
