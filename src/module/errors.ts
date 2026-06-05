export class ModuleConflictError extends Error {
  constructor(a: string, b: string) {
    super(`Module conflict: "${a}" conflicts with "${b}"`);
    this.name = "ModuleConflictError";
  }
}

export class ModuleConfigError extends Error {
  constructor(moduleName: string, message: string) {
    super(`Module "${moduleName}" config invalid: ${message}`);
    this.name = "ModuleConfigError";
  }
}

export class ModuleDependencyCycleError extends Error {
  constructor(chain: string[]) {
    super(`Module dependency cycle: ${chain.join(" -> ")}`);
    this.name = "ModuleDependencyCycleError";
  }
}
