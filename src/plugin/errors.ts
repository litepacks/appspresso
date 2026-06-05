export class PluginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PluginError";
  }
}

export class PluginConfigError extends PluginError {
  constructor(pluginName: string, detail: string) {
    super(`[${pluginName}] Invalid plugin config: ${detail}`);
    this.name = "PluginConfigError";
  }
}

export class PluginMissingDependencyError extends PluginError {
  constructor(pluginName: string, capability: string) {
    super(
      `[${pluginName}] Missing required capability "${capability}". Enable the matching AppspressoHost provider or add a plugin that supplies it.`,
    );
    this.name = "PluginMissingDependencyError";
  }
}

export class PluginDependencyCycleError extends PluginError {
  constructor(cycle: string[]) {
    super(`Plugin dependency cycle: ${cycle.join(" → ")} → ${cycle[0] ?? ""}`);
    this.name = "PluginDependencyCycleError";
  }
}

export class PluginConflictError extends PluginError {
  constructor(pluginName: string, other: string) {
    super(`[${pluginName}] Conflicts with plugin "${other}"`);
    this.name = "PluginConflictError";
  }
}
