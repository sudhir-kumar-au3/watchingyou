import { Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { randomFloydInput, type FloydInput } from './floydWarshall';

export const FloydWarshallControls = ({
  input,
  onChange,
}: ControlsProps<FloydInput>) => (
  <div className="flex flex-col gap-4">
    <span className="font-mono text-xs text-haze">
      {input.labels.length} vertices · {input.edges.length} directed edges
    </span>
    <button
      type="button"
      onClick={() => onChange(randomFloydInput())}
      className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-violet/50 hover:text-violet active:scale-95"
    >
      <Shuffle size={15} />
      New random graph
    </button>
  </div>
);
