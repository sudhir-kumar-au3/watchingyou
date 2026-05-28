import { Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { Select } from '@/components/ui/Select';
import { randomUnionFind, type UnionFindInput } from './unionFind';

const SIZES = ['6', '8', '10', '12'];

export const UnionFindControls = ({
  input,
  onChange,
}: ControlsProps<UnionFindInput>) => (
  <div className="flex flex-col gap-4">
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wide text-haze">Elements</span>
      <Select
        label="Element count"
        value={String(input.count)}
        options={SIZES.map((size) => ({ value: size, label: size }))}
        onChange={(value) => onChange(randomUnionFind(Number(value)))}
      />
    </label>
    <span className="font-mono text-xs text-haze">
      {input.count} elements · {input.ops.length} operations
    </span>
    <button
      type="button"
      onClick={() => onChange(randomUnionFind(input.count))}
      className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
    >
      <Shuffle size={15} />
      New random operations
    </button>
  </div>
);
