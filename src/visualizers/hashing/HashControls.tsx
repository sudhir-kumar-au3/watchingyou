import { useState, type FormEvent } from 'react';
import { Check, Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { Select } from '@/components/ui/Select';
import { cn } from '@/utils/cn';
import {
  randomHashInput,
  type HashInput,
  type HashStrategy,
} from './hashTable';

const SIZES = ['7', '11', '13', '17'];

const parseValues = (raw: string): number[] =>
  raw
    .split(/[\s,]+/)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value) && value >= 0)
    .slice(0, 12);

export const HashControls = ({ input, onChange }: ControlsProps<HashInput>) => {
  const [draft, setDraft] = useState('');

  const setStrategy = (strategy: HashStrategy): void => {
    const size = strategy === 'linear' ? 11 : 7;
    onChange({ ...input, strategy, size });
  };

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const values = parseValues(draft);
    if (values.length >= 1) {
      onChange({ ...input, values });
      setDraft('');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        {(['chaining', 'linear'] as const).map((strategy) => (
          <button
            key={strategy}
            type="button"
            onClick={() => setStrategy(strategy)}
            className={cn(
              'rounded-xl px-3 py-2.5 text-sm font-medium transition active:scale-95',
              input.strategy === strategy
                ? 'bg-amber/15 text-amber'
                : 'glass text-haze hover:text-mist'
            )}
          >
            {strategy === 'chaining' ? 'Chaining' : 'Linear probe'}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-haze">
          Table size (buckets)
        </span>
        <Select
          label="Table size"
          value={String(input.size)}
          options={SIZES.map((size) => ({ value: size, label: size }))}
          onChange={(size) => onChange({ ...input, size: Number(size) })}
        />
      </label>

      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Keys e.g. 8, 15, 3, 10, 5"
          className={cn(
            'flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/60',
            'focus:border-amber/50'
          )}
        />
        <button
          type="submit"
          aria-label="Apply keys"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-mist transition hover:border-amber/50 hover:text-amber active:scale-95"
        >
          <Check size={18} />
        </button>
      </form>

      <button
        type="button"
        onClick={() => onChange(randomHashInput(input.strategy))}
        className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-amber/50 hover:text-amber active:scale-95"
      >
        <Shuffle size={15} />
        Random keys
      </button>
    </div>
  );
};
