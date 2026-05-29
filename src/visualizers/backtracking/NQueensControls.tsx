import type { ControlsProps } from '@/core/engine/types';
import { Select } from '@/components/ui/Select';

const SIZES = ['4', '5', '6', '7', '8'];

export const NQueensControls = ({ input, onChange }: ControlsProps<number>) => (
  <div className="flex flex-col gap-4">
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wide text-haze">
        Board size (N)
      </span>
      <Select
        label="Board size"
        value={String(input)}
        options={SIZES.map((size) => ({ value: size, label: `${size} × ${size}` }))}
        onChange={(value) => onChange(Number(value))}
      />
    </label>
    <span className="font-mono text-xs text-haze">
      {input} queens · larger boards = deeper search
    </span>
  </div>
);
