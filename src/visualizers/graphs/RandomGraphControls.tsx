import { Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { randomWeightedGraph, type GraphInput } from './types';

export const RandomGraphControls = ({
  input,
  onChange,
}: ControlsProps<GraphInput>) => (
  <div className="flex flex-col gap-4">
    <span className="font-mono text-xs text-haze">
      {input.nodes.length} nodes · {input.edges.length} weighted edges · sorted
      globally, no start needed
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
