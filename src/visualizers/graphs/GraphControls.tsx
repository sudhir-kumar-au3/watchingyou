import { Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { Select } from '@/components/ui/Select';
import { randomGraph, type GraphInput } from './types';

export const GraphControls = ({
  input,
  onChange,
}: ControlsProps<GraphInput>) => (
  <div className="flex flex-col gap-4">
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wide text-haze">
        Start node
      </span>
      <Select
        label="Start node"
        value={input.start}
        options={input.nodes.map((node) => ({
          value: node.id,
          label: node.id,
        }))}
        onChange={(start) => onChange({ ...input, start })}
      />
    </label>
    <button
      type="button"
      onClick={() => onChange(randomGraph(input.nodes.length))}
      className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
    >
      <Shuffle size={15} />
      New random graph
    </button>
  </div>
);
