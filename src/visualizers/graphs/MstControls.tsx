import { Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { Select } from '@/components/ui/Select';
import { randomWeightedGraph, type GraphInput } from './types';

export const MstControls = ({ input, onChange }: ControlsProps<GraphInput>) => {
  const options = input.nodes.map((node) => ({ value: node.id, label: node.id }));

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-haze">
          Grow from
        </span>
        <Select
          label="Start node"
          value={input.start}
          options={options}
          onChange={(start) => onChange({ ...input, start })}
        />
      </label>
      <span className="font-mono text-xs text-haze">
        {input.nodes.length} nodes · {input.edges.length} weighted edges
      </span>
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
