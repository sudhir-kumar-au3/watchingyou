import { parse } from 'acorn';
import { TimelineRecorder } from '@/core/timeline/recorder';
import type { Timeline } from '@/core/timeline/types';
import { Environment, RuntimeError } from './environment';
import { Closure, serialize } from './values';
import { createProgramState, type ProgramState, type VariableView } from './types';

interface Node {
  type: string;
  start: number;
  end: number;
  loc?: { start: { line: number } };
  [key: string]: unknown;
}

const STEP_CAP = 15000;
const DEPTH_CAP = 600;
const OUTPUT_CAP = 500;

class ReturnSignal {
  constructor(readonly value: unknown) {}
}
class BreakSignal {}
class ContinueSignal {}

export interface RunProgramResult {
  timeline: Timeline<ProgramState> | null;
  error: string | null;
}

export const runProgram = (code: string): RunProgramResult => {
  const recorder = new TimelineRecorder<ProgramState>();
  const output: string[] = [];
  const stack: string[] = [];
  let steps = 0;
  let changedName: string | null = null;

  const tick = (): void => {
    steps += 1;
    if (steps > STEP_CAP) {
      throw new RuntimeError(
        `Step limit (${STEP_CAP}) exceeded — likely an infinite loop.`
      );
    }
  };

  const collectVariables = (env: Environment): VariableView[] => {
    const views: VariableView[] = [];
    const seen = new Set<string>();
    let current: Environment | null = env;
    while (current) {
      const isGlobal = current.parent === null;
      for (const [name, value] of current.vars) {
        if (seen.has(name) || name === 'console') continue;
        if (isGlobal && BUILTIN_NAMES.has(name)) continue;
        seen.add(name);
        const { preview, array } = serialize(value);
        views.push({
          name,
          kind: isGlobal ? 'global' : 'local',
          preview,
          array,
          changed: name === changedName,
        });
      }
      current = current.parent;
    }
    return views;
  };

  const snippet = (node: Node): string => {
    const text = code.slice(node.start, node.end).replace(/\s+/g, ' ').trim();
    return text.length > 64 ? `${text.slice(0, 61)}…` : text;
  };

  const emit = (node: Node, description: string, env: Environment): void => {
    tick();
    recorder.capture(
      createProgramState({
        line: node.loc?.start.line ?? 0,
        variables: collectVariables(env),
        callStack: [...stack],
        output: [...output],
        depth: stack.length,
      }),
      description
    );
    changedName = null;
  };

  const evalExpr = (node: Node, env: Environment): unknown => {
    switch (node.type) {
      case 'Literal':
        return node.value;
      case 'Identifier':
        return env.lookup(node.name as string);
      case 'TemplateLiteral': {
        const quasis = node.quasis as Node[];
        const expressions = node.expressions as Node[];
        let result = '';
        quasis.forEach((quasi, index) => {
          result += (quasi.value as { cooked: string }).cooked;
          if (index < expressions.length) {
            result += String(evalExpr(expressions[index], env));
          }
        });
        return result;
      }
      case 'ArrayExpression':
        return (node.elements as Node[]).map((element) =>
          element ? evalExpr(element, env) : undefined
        );
      case 'ObjectExpression': {
        const obj: Record<string, unknown> = {};
        for (const prop of node.properties as Node[]) {
          const key = prop.computed
            ? String(evalExpr(prop.key as Node, env))
            : ((prop.key as Node).name as string) ??
              ((prop.key as Node).value as string);
          obj[key] = evalExpr(prop.value as Node, env);
        }
        return obj;
      }
      case 'UnaryExpression': {
        const arg = evalExpr(node.argument as Node, env);
        switch (node.operator) {
          case '!':
            return !arg;
          case '-':
            return -(arg as number);
          case '+':
            return +(arg as number);
          case 'typeof':
            return typeof arg;
          default:
            throw new RuntimeError(`Unsupported operator ${node.operator}`);
        }
      }
      case 'BinaryExpression':
        return applyBinary(
          node.operator as string,
          evalExpr(node.left as Node, env),
          evalExpr(node.right as Node, env)
        );
      case 'LogicalExpression': {
        const left = evalExpr(node.left as Node, env);
        if (node.operator === '&&') return left ? evalExpr(node.right as Node, env) : left;
        if (node.operator === '||') return left ? left : evalExpr(node.right as Node, env);
        return left ?? evalExpr(node.right as Node, env);
      }
      case 'ConditionalExpression':
        return evalExpr(node.test as Node, env)
          ? evalExpr(node.consequent as Node, env)
          : evalExpr(node.alternate as Node, env);
      case 'AssignmentExpression':
        return evalAssignment(node, env);
      case 'UpdateExpression':
        return evalUpdate(node, env);
      case 'MemberExpression':
        return evalMember(node, env).value;
      case 'CallExpression':
        return evalCall(node, env);
      case 'ArrowFunctionExpression':
      case 'FunctionExpression':
        return makeClosure(node, env);
      default:
        throw new RuntimeError(`Unsupported expression: ${node.type}`);
    }
  };

  const evalMember = (
    node: Node,
    env: Environment
  ): { object: unknown; key: string | number; value: unknown } => {
    const object = evalExpr(node.object as Node, env);
    const key = node.computed
      ? (evalExpr(node.property as Node, env) as string | number)
      : ((node.property as Node).name as string);
    if (object === null || object === undefined) {
      throw new RuntimeError(`Cannot read properties of ${object} (reading '${key}')`);
    }
    return { object, key, value: (object as Record<string, unknown>)[key] };
  };

  const evalAssignment = (node: Node, env: Environment): unknown => {
    const right = evalExpr(node.right as Node, env);
    const target = node.left as Node;
    const op = node.operator as string;
    if (target.type === 'Identifier') {
      const name = target.name as string;
      const next =
        op === '='
          ? right
          : applyBinary(op.slice(0, -1), env.lookup(name), right);
      env.assign(name, next);
      changedName = name;
      return next;
    }
    if (target.type === 'MemberExpression') {
      const object = evalExpr(target.object as Node, env);
      const key = target.computed
        ? (evalExpr(target.property as Node, env) as string | number)
        : ((target.property as Node).name as string);
      const container = object as Record<string | number, unknown>;
      const next =
        op === '=' ? right : applyBinary(op.slice(0, -1), container[key], right);
      container[key] = next;
      if ((target.object as Node).type === 'Identifier') {
        changedName = (target.object as Node).name as string;
      }
      return next;
    }
    throw new RuntimeError('Unsupported assignment target');
  };

  const evalUpdate = (node: Node, env: Environment): unknown => {
    const target = node.argument as Node;
    const delta = node.operator === '++' ? 1 : -1;
    if (target.type === 'Identifier') {
      const name = target.name as string;
      const old = env.lookup(name) as number;
      env.assign(name, old + delta);
      changedName = name;
      return node.prefix ? old + delta : old;
    }
    if (target.type === 'MemberExpression') {
      const { object, key } = evalMember(target, env);
      const container = object as Record<string | number, unknown>;
      const old = container[key] as number;
      container[key] = old + delta;
      return node.prefix ? old + delta : old;
    }
    throw new RuntimeError('Unsupported update target');
  };

  const makeClosure = (node: Node, env: Environment): Closure => {
    const params = (node.params as Node[]).map((param) => param.name as string);
    return new Closure(
      params,
      node.body,
      env,
      (node.id as Node | null)?.name as string,
      node.type === 'ArrowFunctionExpression' && (node.body as Node).type !== 'BlockStatement'
    );
  };

  const applyClosure = (
    closure: Closure,
    args: unknown[],
    thisValue: unknown
  ): unknown => {
    if (stack.length >= DEPTH_CAP) {
      throw new RuntimeError('Maximum call stack size exceeded.');
    }
    const local = new Environment(closure.env, closure.name || 'anonymous');
    closure.params.forEach((param, index) => local.declare(param, args[index]));
    if (thisValue !== undefined) local.declare('this', thisValue);
    stack.push(closure.name || 'ƒ');
    try {
      if (closure.isExpression) {
        return evalExpr(closure.body as Node, local);
      }
      execBlock((closure.body as Node).body as Node[], local);
      return undefined;
    } catch (signal) {
      if (signal instanceof ReturnSignal) return signal.value;
      throw signal;
    } finally {
      stack.pop();
    }
  };

  const evalCall = (node: Node, env: Environment): unknown => {
    const args = (node.arguments as Node[]).map((arg) => evalExpr(arg, env));
    const callee = node.callee as Node;
    if (callee.type === 'MemberExpression') {
      const { object, key, value } = evalMember(callee, env);
      if (value instanceof Closure) return applyClosure(value, args, object);
      if (typeof value === 'function') {
        return (value as (...a: unknown[]) => unknown).apply(object, args);
      }
      throw new RuntimeError(`${String(key)} is not a function`);
    }
    const fn = evalExpr(callee, env);
    if (fn instanceof Closure) return applyClosure(fn, args, undefined);
    if (typeof fn === 'function') {
      return (fn as (...a: unknown[]) => unknown)(...args);
    }
    throw new RuntimeError('Attempted to call a non-function value');
  };

  const execBlock = (statements: Node[], env: Environment): void => {
    for (const statement of statements) {
      if (statement.type === 'FunctionDeclaration') {
        env.declare(
          (statement.id as Node).name as string,
          makeClosure(statement, env)
        );
      }
    }
    for (const statement of statements) {
      evalStmt(statement, env);
    }
  };

  const evalStmt = (node: Node, env: Environment): void => {
    switch (node.type) {
      case 'VariableDeclaration': {
        for (const declarator of node.declarations as Node[]) {
          const name = (declarator.id as Node).name as string;
          const value = declarator.init
            ? evalExpr(declarator.init as Node, env)
            : undefined;
          env.declare(name, value);
          changedName = name;
          emit(node, snippet(node), env);
        }
        return;
      }
      case 'ExpressionStatement':
        evalExpr(node.expression as Node, env);
        emit(node, snippet(node), env);
        return;
      case 'FunctionDeclaration':
        emit(node, `Define ${(node.id as Node).name}()`, env);
        return;
      case 'BlockStatement':
        execBlock(node.body as Node[], new Environment(env, env.fnName));
        return;
      case 'IfStatement': {
        emit(node.test as Node, `if (${snippet(node.test as Node)})`, env);
        if (evalExpr(node.test as Node, env)) {
          evalStmt(node.consequent as Node, env);
        } else if (node.alternate) {
          evalStmt(node.alternate as Node, env);
        }
        return;
      }
      case 'ForStatement': {
        const loopEnv = new Environment(env, env.fnName);
        if (node.init) {
          if ((node.init as Node).type === 'VariableDeclaration') {
            evalStmt(node.init as Node, loopEnv);
          } else {
            evalExpr(node.init as Node, loopEnv);
          }
        }
        while (true) {
          tick();
          if (node.test && !evalExpr(node.test as Node, loopEnv)) break;
          emit(node.test ? (node.test as Node) : node, 'loop', loopEnv);
          try {
            evalStmt(node.body as Node, loopEnv);
          } catch (signal) {
            if (signal instanceof BreakSignal) break;
            if (!(signal instanceof ContinueSignal)) throw signal;
          }
          if (node.update) evalExpr(node.update as Node, loopEnv);
        }
        return;
      }
      case 'WhileStatement': {
        while (true) {
          tick();
          if (!evalExpr(node.test as Node, env)) break;
          emit(node.test as Node, `while (${snippet(node.test as Node)})`, env);
          try {
            evalStmt(node.body as Node, env);
          } catch (signal) {
            if (signal instanceof BreakSignal) break;
            if (!(signal instanceof ContinueSignal)) throw signal;
          }
        }
        return;
      }
      case 'DoWhileStatement': {
        do {
          tick();
          try {
            evalStmt(node.body as Node, env);
          } catch (signal) {
            if (signal instanceof BreakSignal) break;
            if (!(signal instanceof ContinueSignal)) throw signal;
          }
        } while (evalExpr(node.test as Node, env));
        return;
      }
      case 'ForOfStatement': {
        const iterable = evalExpr(node.right as Node, env) as unknown[];
        const decl = node.left as Node;
        const name = ((decl.declarations as Node[])[0].id as Node).name as string;
        for (const item of iterable) {
          tick();
          const iterEnv = new Environment(env, env.fnName);
          iterEnv.declare(name, item);
          changedName = name;
          emit(decl, `for…of ${name}`, iterEnv);
          try {
            evalStmt(node.body as Node, iterEnv);
          } catch (signal) {
            if (signal instanceof BreakSignal) break;
            if (!(signal instanceof ContinueSignal)) throw signal;
          }
        }
        return;
      }
      case 'ReturnStatement': {
        const value = node.argument
          ? evalExpr(node.argument as Node, env)
          : undefined;
        emit(node, snippet(node), env);
        throw new ReturnSignal(value);
      }
      case 'BreakStatement':
        throw new BreakSignal();
      case 'ContinueStatement':
        throw new ContinueSignal();
      case 'EmptyStatement':
        return;
      default:
        throw new RuntimeError(`Unsupported statement: ${node.type}`);
    }
  };

  const global = new Environment(null, 'global');
  installBuiltins(global, (line) => {
    if (output.length < OUTPUT_CAP) output.push(line);
  });

  try {
    const program = parse(code, {
      ecmaVersion: 2022,
      locations: true,
    }) as unknown as Node;
    recorder.capture(
      createProgramState({ line: 1 }),
      'Start execution.'
    );
    execBlock(program.body as Node[], global);
    recorder.capture(
      createProgramState({
        line: 0,
        variables: collectVariables(global),
        callStack: [],
        output: [...output],
        depth: 0,
      }),
      'Program finished.'
    );
    return { timeline: recorder.build(), error: null };
  } catch (error) {
    if (error instanceof RuntimeError || error instanceof SyntaxError) {
      return { timeline: recorder.build(), error: error.message };
    }
    return {
      timeline: recorder.build(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const BUILTIN_NAMES = new Set([
  'Math',
  'JSON',
  'Number',
  'String',
  'Boolean',
  'Array',
  'Object',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'undefined',
  'NaN',
  'Infinity',
  'this',
]);

const installBuiltins = (
  env: Environment,
  log: (line: string) => void
): void => {
  env.declare('console', {
    log: (...args: unknown[]) =>
      log(
        args
          .map((arg) =>
            typeof arg === 'string' ? arg : serialize(arg).preview
          )
          .join(' ')
      ),
  });
  env.declare('Math', Math);
  env.declare('JSON', JSON);
  env.declare('Number', Number);
  env.declare('String', String);
  env.declare('Boolean', Boolean);
  env.declare('Array', Array);
  env.declare('Object', Object);
  env.declare('parseInt', parseInt);
  env.declare('parseFloat', parseFloat);
  env.declare('isNaN', isNaN);
  env.declare('isFinite', isFinite);
  env.declare('undefined', undefined);
  env.declare('NaN', NaN);
  env.declare('Infinity', Infinity);
};

const applyBinary = (op: string, left: unknown, right: unknown): unknown => {
  const a = left as number;
  const b = right as number;
  switch (op) {
    case '+':
      return (left as number) + (right as number);
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return a / b;
    case '%':
      return a % b;
    case '**':
      return a ** b;
    case '==':
      return left == right;
    case '===':
      return left === right;
    case '!=':
      return left != right;
    case '!==':
      return left !== right;
    case '<':
      return a < b;
    case '<=':
      return a <= b;
    case '>':
      return a > b;
    case '>=':
      return a >= b;
    case '&':
      return a & b;
    case '|':
      return a | b;
    case '^':
      return a ^ b;
    case '<<':
      return a << b;
    case '>>':
      return a >> b;
    case '>>>':
      return a >>> b;
    default:
      throw new RuntimeError(`Unsupported operator ${op}`);
  }
};
