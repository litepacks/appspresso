# todo-offline

Offline-first todo list — Jotai local state + Appspresso sync outbox demo.

## Run

```bash
cd ../.. && npm run build:lib
cd examples/todo-offline
npm install
npm run dev
```

## What it demonstrates

- Local todos in Jotai
- `enqueueMutationLikeOperation` when adding items (web outbox)
- `useOfflineMode` / sync status for pending count
- Playbook: [docs/playbooks/offline-sync.md](../../docs/playbooks/offline-sync.md)

Add todos while offline (DevTools → Network offline), then go online to flush.

```bash
appspresso doctor
```
