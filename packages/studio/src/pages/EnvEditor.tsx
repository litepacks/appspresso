import { Plus, RefreshCw, Variable } from "lucide-react";
import { useState } from "react";
import { EditorItem } from "@/components/EditorItem";
import { EmptyState } from "@/components/EmptyState";
import { FormField } from "@/components/FormField";
import { EditorLayout } from "@/components/EditorLayout";
import { SwitchRow } from "@/components/SwitchRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type EnvVar = {
  key: string;
  description: string;
  required?: boolean;
  example?: string;
  secret?: boolean;
  format?: string;
};

type EnvSchema = { variables: EnvVar[] };

type Props = {
  schema: unknown;
  exampleText: string;
  onChange: (schema: EnvSchema, exampleText: string) => void;
};

export function EnvEditor({ schema, exampleText, onChange }: Props) {
  const envSchema = (schema ?? { variables: [] }) as EnvSchema;
  const vars = envSchema.variables ?? [];
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true });

  const toggle = (i: number) => setExpanded((s) => ({ ...s, [i]: !s[i] }));
  const isExpanded = (i: number) => expanded[i] === true;

  const updateVar = (index: number, patch: Partial<EnvVar>) => {
    const next = vars.map((v, i) => (i === index ? { ...v, ...patch } : v));
    onChange({ variables: next }, exampleText);
  };

  const removeVar = (index: number) => {
    onChange({ variables: vars.filter((_, i) => i !== index) }, exampleText);
  };

  const addVar = () => {
    const nextIndex = vars.length;
    onChange(
      {
        variables: [
          ...vars,
          {
            key: "VITE_NEW_KEY",
            description: "Describe this variable",
            example: "",
            format: "string",
          },
        ],
      },
      exampleText,
    );
    setExpanded((s) => ({ ...s, [nextIndex]: true }));
  };

  const syncExampleFromSchema = () => {
    const lines = [
      "# Copy to `.env` (never commit secrets)",
      "",
      ...vars.map((v) => `${v.key}=${v.example ?? ""}`),
      "",
    ];
    onChange(envSchema, lines.join("\n"));
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={syncExampleFromSchema}>
          <RefreshCw />
          Sync example
        </Button>
        <Button type="button" size="sm" onClick={addVar}>
          <Plus />
          Add variable
        </Button>
      </div>

      <EditorLayout
        list={
        <Card>
          <CardHeader className="py-2.5">
            <CardTitle>Variables ({vars.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {vars.length === 0 ? (
              <EmptyState
                icon={Variable}
                title="No variables"
                description="Add keys for schema and .env.example."
                action={
                  <Button type="button" variant="outline" size="sm" onClick={addVar}>
                    <Plus />
                    Add
                  </Button>
                }
              />
            ) : (
              vars.map((v, i) => (
                <EditorItem
                  key={`${v.key}-${i}`}
                  title={v.key}
                  subtitle={v.description}
                  expanded={isExpanded(i)}
                  onToggle={() => toggle(i)}
                  onRemove={() => removeVar(i)}
                  badges={
                    <>
                      {v.required ? <Badge variant="secondary">req</Badge> : null}
                      {v.format ? <Badge variant="outline">{v.format}</Badge> : null}
                    </>
                  }
                >
                  <FormField label="Key">
                    <Input
                      value={v.key}
                      onChange={(e) => updateVar(i, { key: e.target.value })}
                    />
                  </FormField>
                  <FormField label="Description">
                    <Input
                      value={v.description}
                      onChange={(e) => updateVar(i, { description: e.target.value })}
                    />
                  </FormField>
                  <FormField label="Example">
                    <Input
                      value={v.example ?? ""}
                      onChange={(e) => updateVar(i, { example: e.target.value })}
                    />
                  </FormField>
                  <FormField label="Format">
                    <Select
                      value={v.format ?? "string"}
                      onValueChange={(format) => updateVar(i, { format })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">string</SelectItem>
                        <SelectItem value="url">url</SelectItem>
                        <SelectItem value="boolean">boolean</SelectItem>
                        <SelectItem value="json">json</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <SwitchRow
                    id={`req-${i}`}
                    label="Required"
                    checked={v.required ?? false}
                    onCheckedChange={(checked) => updateVar(i, { required: checked })}
                    className="sm:col-span-2"
                  />
                </EditorItem>
              ))
            )}
          </CardContent>
        </Card>
        }
        detail={
        <Card className="h-fit lg:sticky lg:top-3">
          <CardHeader className="py-2.5">
            <CardTitle>.env.example</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              className="min-h-[320px]"
              value={exampleText}
              onChange={(e) => onChange(envSchema, e.target.value)}
            />
          </CardContent>
        </Card>
        }
      />
    </div>
  );
}
