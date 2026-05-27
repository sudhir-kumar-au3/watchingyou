import { Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { Select } from '@/components/ui/Select';
import { randomWeightedGraph, type GraphInput } from './types';

export const WeightedGraphControls = ({
  input,
  onChange,
}: ControlsProps<GraphInput>) => {
  const options = input.nodes.map((node) => ({
    value: node.id,
    label: node.id,
  }));
  const goal = input.goal ?? input.nodes[input.nodes.length - 1].id;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-haze">
            Start
          </span>
          <Select
            label="Start node"
            value={input.start}
            options={options}
            onChange={(start) => onChange({ ...input, start })}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-haze">Goal</span>
          <Select
            label="Goal node"
            value={goal}
            options={options}
            onChange={(next) => onChange({ ...input, goal: next })}
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => onChange(randomWeightedGraph(input.nodes.length))}
        className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
      >
        <Shuffle size={15} />
        New random graph
      </button>
    </div>
  );
};
