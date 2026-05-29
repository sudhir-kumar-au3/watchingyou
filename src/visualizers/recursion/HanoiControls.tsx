import type { ControlsProps } from '@/core/engine/types';
import { Select } from '@/components/ui/Select';

const SIZES = ['3', '4', '5', '6'];

export const HanoiControls = ({ input, onChange }: ControlsProps<number>) => (
  <div className="flex flex-col gap-4">
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wide text-haze">Disks</span>
      <Select
        label="Number of disks"
        value={String(input)}
        options={SIZES.map((size) => ({ value: size, label: `${size} disks` }))}
        onChange={(value) => onChange(Number(value))}
      />
    </label>
    <span className="font-mono text-xs text-haze">
      {input} disks · {2 ** input - 1} moves
    </span>
  </div>
);
