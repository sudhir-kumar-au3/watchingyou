import { motion } from 'framer-motion';
import { Layers, Terminal } from 'lucide-react';
import type { ProgramState, VariableView } from '@/core/interpreter/types';
import { cn } from '@/utils/cn';

const ArrayCells = ({ values }: { values: number[] }) => {
  const max = Math.max(...values, 1);
  return (
    <div className="flex flex-wrap gap-1">
      {values.slice(0, 40).map((value, index) => (
        <div
          key={index}
          className="flex h-9 w-7 flex-col items-center justify-end overflow-hidden rounded bg-black/30"
        >
          <div
            className="w-full bg-cyan/70"
            style={{ height: `${(value / max) * 100}%` }}
          />
          <span className="py-0.5 font-mono text-[9px] text-mist">{value}</span>
        </div>
      ))}
    </div>
  );
};

const VariableCard = ({ variable }: { variable: VariableView }) => (
  <motion.div
    layout
    animate={{
      borderColor: variable.changed
        ? 'rgb(34 211 238 / 0.6)'
        : 'rgb(255 255 255 / 0.08)',
      boxShadow: variable.changed
        ? '0 0 18px -4px rgb(34 211 238 / 0.5)'
        : '0 0 0 transparent',
    }}
    className="flex flex-col gap-2 rounded-xl border bg-white/5 p-3"
  >
    <div className="flex items-center justify-between">
      <span className="font-mono text-sm font-semibold text-cyan">
        {variable.name}
      </span>
      <span className="text-[9px] uppercase tracking-wide text-haze">
        {variable.kind}
      </span>
    </div>
    {variable.array ? (
      <ArrayCells values={variable.array} />
    ) : (
      <span className="break-all font-mono text-sm text-mist">
        {variable.preview}
      </span>
    )}
  </motion.div>
);

export const CodeStateRenderer = ({ state }: { state: ProgramState }) => (
  <div className="flex h-full flex-col gap-4 overflow-y-auto">
    <section className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-haze">
        Variables
      </h4>
      {state.variables.length === 0 ? (
        <p className="text-sm text-haze/70">No variables in scope yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {state.variables.map((variable) => (
            <VariableCard key={variable.name} variable={variable} />
          ))}
        </div>
      )}
    </section>

    <section className="flex flex-col gap-2">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-haze">
        <Layers size={13} />
        Call stack
        {state.depth > 0 && (
          <span className="font-mono text-cyan">depth {state.depth}</span>
        )}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-md bg-white/5 px-2.5 py-1 font-mono text-xs text-haze">
          global
        </span>
        {state.callStack.map((name, index) => (
          <span
            key={index}
            className={cn(
              'rounded-md px-2.5 py-1 font-mono text-xs',
              index === state.callStack.length - 1
                ? 'bg-violet/20 text-violet'
                : 'bg-white/5 text-mist'
            )}
          >
            {name}()
          </span>
        ))}
      </div>
    </section>

    <section className="flex min-h-0 flex-1 flex-col gap-2">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-haze">
        <Terminal size={13} />
        Console
      </h4>
      <div className="flex-1 rounded-xl bg-black/40 p-3 font-mono text-xs">
        {state.output.length === 0 ? (
          <span className="text-haze/60">No output.</span>
        ) : (
          state.output.map((line, index) => (
            <div key={index} className="text-lime/90">
              {line}
            </div>
          ))
        )}
      </div>
    </section>
  </div>
);
