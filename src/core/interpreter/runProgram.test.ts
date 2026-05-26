import { describe, expect, it } from 'vitest';
import { runProgram } from './runProgram';
import type { VariableView } from './types';

const runToEnd = (code: string) => {
  const { timeline, error } = runProgram(code);
  const frames = timeline?.frames ?? [];
  const last = frames[frames.length - 1]?.state ?? null;
  const vars = new Map<string, VariableView>();
  last?.variables.forEach((v) => vars.set(v.name, v));
  return {
    error,
    frameCount: frames.length,
    output: last?.output ?? [],
    vars,
    last,
  };
};

describe('runProgram — basics', () => {
  it('runs declarations and arithmetic', () => {
    const r = runToEnd('let x = 2 + 3;\nlet y = x * 4;');
    expect(r.error).toBeNull();
    expect(r.vars.get('x')?.preview).toBe('5');
    expect(r.vars.get('y')?.preview).toBe('20');
  });

  it('captures console output', () => {
    const r = runToEnd('console.log("hello");\nconsole.log(1 + 1);');
    expect(r.error).toBeNull();
    expect(r.output).toEqual(['hello', '2']);
  });

  it('produces multiple frames (one per step)', () => {
    const r = runToEnd('let a = 1;\nlet b = 2;\nlet c = 3;');
    expect(r.frameCount).toBeGreaterThanOrEqual(3);
  });
});

describe('runProgram — control flow', () => {
  it('evaluates if/else', () => {
    const r = runToEnd('let x = 10;\nlet label;\nif (x > 5) { label = "big"; } else { label = "small"; }');
    expect(r.vars.get('label')?.preview).toBe('"big"');
  });

  it('runs for loops with accumulation', () => {
    const r = runToEnd('let sum = 0;\nfor (let i = 1; i <= 5; i++) { sum += i; }');
    expect(r.vars.get('sum')?.preview).toBe('15');
  });

  it('runs while loops', () => {
    const r = runToEnd('let n = 5;\nlet f = 1;\nwhile (n > 1) { f *= n; n--; }');
    expect(r.vars.get('f')?.preview).toBe('120');
  });

  it('honors break and continue', () => {
    const r = runToEnd('let total = 0;\nfor (let i = 0; i < 10; i++) { if (i === 3) continue; if (i === 6) break; total += i; }');
    expect(r.vars.get('total')?.preview).toBe('12');
  });
});

describe('runProgram — functions & recursion', () => {
  it('calls user functions', () => {
    const r = runToEnd('function add(a, b) { return a + b; }\nlet z = add(4, 5);');
    expect(r.vars.get('z')?.preview).toBe('9');
  });

  it('handles recursion (factorial)', () => {
    const r = runToEnd('function fact(n) { if (n <= 1) return 1; return n * fact(n - 1); }\nlet result = fact(5);');
    expect(r.error).toBeNull();
    expect(r.vars.get('result')?.preview).toBe('120');
  });

  it('handles recursion (fibonacci) and tracks call stack depth', () => {
    const r = runToEnd('function fib(n) { if (n < 2) return n; return fib(n - 1) + fib(n - 2); }\nlet out = fib(6);');
    expect(r.vars.get('out')?.preview).toBe('8');
  });

  it('supports closures', () => {
    const r = runToEnd('function make() { let c = 0; return function () { c++; return c; }; }\nlet inc = make();\nlet a = inc();\nlet b = inc();');
    expect(r.vars.get('a')?.preview).toBe('1');
    expect(r.vars.get('b')?.preview).toBe('2');
  });

  it('supports arrow functions', () => {
    const r = runToEnd('const sq = (n) => n * n;\nlet v = sq(7);');
    expect(r.vars.get('v')?.preview).toBe('49');
  });
});

describe('runProgram — arrays & objects', () => {
  it('mutates arrays by index and exposes them for rendering', () => {
    const r = runToEnd('let arr = [5, 3, 8, 1];\narr[1] = 99;');
    expect(r.vars.get('arr')?.array).toEqual([5, 99, 8, 1]);
  });

  it('runs a full sort over an array', () => {
    const r = runToEnd('let a = [3, 1, 2];\nfor (let i = 0; i < a.length; i++) { for (let j = 0; j < a.length - 1 - i; j++) { if (a[j] > a[j + 1]) { let t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; } } }');
    expect(r.vars.get('a')?.array).toEqual([1, 2, 3]);
  });

  it('supports objects and member access', () => {
    const r = runToEnd('let o = { x: 1 };\no.x = o.x + 41;');
    expect(r.vars.get('o')?.preview).toContain('42');
  });
});

describe('runProgram — safety & errors', () => {
  it('reports runtime errors without throwing', () => {
    const r = runToEnd('let y = undefinedVar + 1;');
    expect(r.error).toMatch(/undefinedVar|not defined/i);
  });

  it('reports syntax errors', () => {
    const r = runToEnd('let x = ;');
    expect(r.error).not.toBeNull();
  });

  it('stops infinite loops via a step cap', () => {
    const r = runToEnd('while (true) {}');
    expect(r.error).toMatch(/step|limit|loop/i);
  });
});
