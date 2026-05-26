export class RuntimeError extends Error {}

const owner = (start: Environment, name: string): Environment | null => {
  let env: Environment | null = start;
  while (env) {
    if (env.vars.has(name)) return env;
    env = env.parent;
  }
  return null;
};

export class Environment {
  readonly vars = new Map<string, unknown>();

  constructor(
    readonly parent: Environment | null = null,
    readonly fnName = 'global'
  ) {}

  declare(name: string, value: unknown): void {
    this.vars.set(name, value);
  }

  assign(name: string, value: unknown): void {
    const env = owner(this, name);
    if (!env) throw new RuntimeError(`${name} is not defined`);
    env.vars.set(name, value);
  }

  lookup(name: string): unknown {
    const env = owner(this, name);
    if (!env) throw new RuntimeError(`${name} is not defined`);
    return env.vars.get(name);
  }

  has(name: string): boolean {
    return owner(this, name) !== null;
  }
}
