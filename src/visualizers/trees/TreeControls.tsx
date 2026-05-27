import { useState, type FormEvent } from 'react';
import { Check, Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { randomValues } from './types';
import { cn } from '@/utils/cn';

const parseValues = (raw: string): number[] => {
  const seen = new Set<number>();
  raw
    .split(/[\s,]+/)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value))
    .forEach((value) => seen.add(value));
  return [...seen].slice(0, 31);
};

export const TreeControls = ({ input, onChange }: ControlsProps<number[]>) => {
  const [draft, setDraft] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const values = parseValues(draft);
    if (values.length >= 1) {
      onChange(values);
      setDraft('');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-haze">
          {input.length} values · insertion order matters
        </span>
        <button
          type="button"
          onClick={() => onChange(randomValues(input.length || 9))}
          className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
        >
          <Shuffle size={15} />
          New values
        </button>
      </div>
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Insertion order e.g. 5, 3, 8, 1, 4"
          className={cn(
            'flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/60',
            'focus:border-cyan/50'
          )}
        />
        <button
          type="submit"
          aria-label="Apply values"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
        >
          <Check size={18} />
        </button>
      </form>
    </div>
  );
};
