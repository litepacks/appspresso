import { Button } from "appspresso/components/ui/button";
import { Input } from "appspresso/components/ui/input";
import { Page } from "appspresso/components/ui/page";
import { Text } from "appspresso/components/ui/text";
import { useOfflineMode } from "appspresso/hooks/useOfflineMode";
import { syncStatusAtom } from "appspresso/state/atoms";
import { enqueueMutationLikeOperation } from "appspresso/sync/sync.service";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { type TodoItem, todosAtom } from "../todo/atoms";

export function TodoPage() {
  const [todos, setTodos] = useAtom(todosAtom);
  const offline = useOfflineMode();
  const sync = useAtomValue(syncStatusAtom);
  const [draft, setDraft] = useState("");

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    const item: TodoItem = {
      id: crypto.randomUUID(),
      text,
      done: false,
      updatedAt: new Date().toISOString(),
    };
    setTodos((prev) => [...prev, item]);
    enqueueMutationLikeOperation({
      operation: "todo.create",
      entityType: "todo",
      entityLocalId: item.id,
      action: "create",
      payload: { path: "/api/todos", body: item },
    });
    setDraft("");
  };

  return (
    <Page title="Todos">
      {offline.isOffline ? (
        <Text className="text-amber-600">Offline — changes queue locally</Text>
      ) : null}
      <Text className="text-muted-foreground text-sm">
        Pending sync: {sync.pendingCount}
      </Text>
      <div className="mt-4 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="New todo"
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <Button type="button" onClick={add}>
          Add
        </Button>
      </div>
      <ul className="mt-4 space-y-2">
        {todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2 rounded border p-2">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => {
                const next = !t.done;
                setTodos((prev) =>
                  prev.map((x) =>
                    x.id === t.id
                      ? {
                          ...x,
                          done: next,
                          updatedAt: new Date().toISOString(),
                        }
                      : x,
                  ),
                );
                enqueueMutationLikeOperation({
                  operation: "todo.update",
                  entityType: "todo",
                  entityLocalId: t.id,
                  action: "update",
                  payload: {
                    path: `/api/todos/${t.id}`,
                    body: { done: next },
                  },
                });
              }}
            />
            <span className={t.done ? "line-through opacity-60" : ""}>
              {t.text}
            </span>
          </li>
        ))}
      </ul>
    </Page>
  );
}
