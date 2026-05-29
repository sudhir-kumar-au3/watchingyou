import type { ControlsProps } from '@/core/engine/types';
import { Select } from '@/components/ui/Select';

const SIZES = ['3', '4', '5'];

export const PermutationsControls = ({
  input,
  onChange,
}: ControlsProps<number[]>) => (
  <div className="flex flex-col gap-4">
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wide text-haze">
        How many items
      </span>
      <Select
        label="Item count"
        value={String(input.length)}
        options={SIZES.map((size) => ({ value: size, label: `${size} items` }))}
        onChange={(value) =>
          onChange(Array.from({ length: Number(value) }, (_, i) => i + 1))
        }
      />
    </label>
    <span className="font-mono text-xs text-haze">
      [{input.join(', ')}] → {input.reduce((acc, _, i) => acc * (i + 1), 1)}{' '}
      permutations
    </span>
  </div>
);
