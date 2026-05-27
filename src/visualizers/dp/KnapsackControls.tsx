import { Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import type { KnapsackInput } from './types';

const randomItems = (count: number): Pick<KnapsackInput, 'weights' | 'values'> => ({
  weights: Array.from({ length: count }, () => Math.floor(Math.random() * 4) + 1),
  values: Array.from({ length: count }, () => Math.floor(Math.random() * 7) + 1),
});

export const KnapsackControls = ({
  input,
  onChange,
}: ControlsProps<KnapsackInput>) => (
  <div className="flex flex-col gap-4">
    <label className="flex flex-col gap-2">
      <span className="flex items-center justify-between text-xs uppercase tracking-wide text-haze">
        Capacity
        <span className="font-mono text-cyan">{input.capacity}</span>
      </span>
      <input
        type="range"
        min={3}
        max={12}
        value={input.capacity}
        onChange={(event) =>
          onChange({ ...input, capacity: Number(event.target.value) })
        }
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-edge outline-none"
      />
    </label>

    <div className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide text-haze">
        Items (weight · value)
      </span>
      <div className="flex flex-wrap gap-1.5">
        {input.weights.map((weight, index) => (
          <span
            key={index}
            className="rounded-md bg-white/5 px-2 py-1 font-mono text-xs text-mist"
          >
            {weight}kg·${input.values[index]}
          </span>
        ))}
      </div>
    </div>

    <button
      type="button"
      onClick={() => onChange({ ...input, ...randomItems(input.weights.length) })}
      className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
    >
      <Shuffle size={15} />
      Random items
    </button>
  </div>
);
