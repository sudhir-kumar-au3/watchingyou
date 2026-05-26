import type { Environment } from './environment';

export class Closure {
  constructor(
    readonly params: string[],
    readonly body: unknown,
    readonly env: Environment,
    readonly name: string,
    readonly isExpression: boolean
  ) {}
}

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'number');

export const serialize = (
  value: unknown,
  depth = 0
): { preview: string; array: number[] | null } => {
  if (value instanceof Closure) {
    return { preview: `ƒ ${value.name || 'anonymous'}()`, array: null };
  }
  if (value === null) return { preview: 'null', array: null };
  if (value === undefined) return { preview: 'undefined', array: null };
  if (typeof value === 'string') {
    return { preview: `"${value}"`, array: null };
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return { preview: String(value), array: null };
  }
  if (Array.isArray(value)) {
    const array = isNumberArray(value) ? value : null;
    if (depth > 1) return { preview: '[…]', array };
    const inner = value
      .slice(0, 12)
      .map((item) => serialize(item, depth + 1).preview)
      .join(', ');
    const suffix = value.length > 12 ? ', …' : '';
    return { preview: `[${inner}${suffix}]`, array };
  }
  if (typeof value === 'object') {
    if (depth > 1) return { preview: '{…}', array: null };
    const entries = Object.entries(value as Record<string, unknown>)
      .slice(0, 8)
      .map(([key, val]) => `${key}: ${serialize(val, depth + 1).preview}`)
      .join(', ');
    return { preview: `{ ${entries} }`, array: null };
  }
  return { preview: String(value), array: null };
};
