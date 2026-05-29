import { describe, expect, it } from 'vitest';
import { sccModule } from './scc';
import { sccSample } from './types';

const finalComponents = (): Record<string, number> => {
  const frames = sccModule.generate(sccSample()).frames;
  return frames[frames.length - 1].state.components ?? {};
};

describe('Strongly Connected Components (Kosaraju)', () => {
  it('groups each cycle into one component', () => {
    const c = finalComponents();
    expect(c.A).toBe(c.B);
    expect(c.B).toBe(c.C);
    expect(c.D).toBe(c.E);
    expect(c.E).toBe(c.F);
    expect(c.G).toBe(c.H);
  });

  it('separates the three cycles into distinct components', () => {
    const c = finalComponents();
    expect(new Set([c.A, c.D, c.G]).size).toBe(3);
  });
});
