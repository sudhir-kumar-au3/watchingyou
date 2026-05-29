import type { ControlsProps } from '@/core/engine/types';
import { Select } from '@/components/ui/Select';

const SIZES = ['30', '50', '80', '100'];

export const SieveControls = ({ input, onChange }: ControlsProps<number>) => (
  <div className="flex flex-col gap-4">
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wide text-haze">
        Sieve up to n
      </span>
      <Select
        label="Upper bound"
        value={String(input)}
        options={SIZES.map((size) => ({ value: size, label: size }))}
        onChange={(value) => onChange(Number(value))}
      />
    </label>
    <span className="font-mono text-xs text-haze">
      primes from 2 to {input}
    </span>
  </div>
);
