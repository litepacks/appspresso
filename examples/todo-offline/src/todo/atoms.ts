import { atomWithStorage, createJSONStorage } from "jotai/utils";

export type TodoItem = {
  id: string;
  text: string;
  done: boolean;
  updatedAt: string;
};

const storage = createJSONStorage<TodoItem[]>(() => localStorage);

export const todosAtom = atomWithStorage<TodoItem[]>(
  "todo-offline_items",
  [],
  storage,
  { getOnInit: true },
);
