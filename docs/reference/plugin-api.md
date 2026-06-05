# Plugin API reference

Entry: `import { definePlugin, createPluginRegistry } from "appspresso/plugin"`

## `definePlugin(definition)`

Returns a factory `(config) => ResolvedAppspressoPlugin` when `configSchema` is set; otherwise `() => plugin`.

### Definition fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Unique id (npm package name recommended) |
| `version` | `string?` | Semver for doctor / logs |
| `configSchema` | `z.ZodType?` | Validates factory argument |
| `requires` | `PluginCapability[]?` | Host must expose capability |
| `after` | `string[]?` | Run after named plugins |
| `conflicts` | `string[]?` | Cannot coexist |
| `optionalPeers` | `string[]?` | Documented soft deps |
| `platforms` | `('web' \| 'native')[]?` | Default both |

### Lifecycle hooks

| Hook | When |
|------|------|
| `setup(ctx, config)` | Host mount, before bootstrap |
| `onBootstrap(ctx, config)` | During `runBootstrap` after remote config |
| `extendProviders(ctx, children)` | Wrap React provider tree |
| `onAppReady(ctx, config)` | Bootstrap gate `ready` |
| `dispose(ctx, config)` | Host unmount |

## `PluginContext`

Stable read surfaces only — no Jotai store or raw SQLite handles.

- `platform`, `logger`, `env`, `config.package`
- `events` — core `appEvents` bus
- `auth?` — `getSnapshot`, `onChange` when auth enabled
- `featureFlags()`, `sqlite()`, `sync()` — read-only snapshots
- `registerErrorReporter`, `registerAnalytics`
- `mergeFeatureFlags`, `mergeI18n`

## `AppspressoHost`

`import { AppspressoHost } from "appspresso/app/AppspressoHost"`

Props: `plugins`, `omit`, `authAdapter`, `filesystemConfig`, `skipBootstrap`.

## Errors

- `PluginConfigError` — invalid config
- `PluginMissingDependencyError` — missing capability
- `PluginDependencyCycleError` — `after` cycle
- `PluginConflictError` — conflicting plugins
