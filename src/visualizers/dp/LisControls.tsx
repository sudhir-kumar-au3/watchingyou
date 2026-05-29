import { useState, type FormEvent } from 'react';
import { Check, Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { cn } from '@/utils/cn';
import { randomLisInput } from './lis';

const parse = (raw: string): number[] =>
  raw
    .split(/[\s,]+/)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value))
    .slice(0, 12);

export const LisControls = ({ input, onChange }: ControlsProps<number[]>) => {
  const [draft, setDraft] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const values = parse(draft);
    if (values.length >= 1) {
      onChange(values);
      setDraft('');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <span className="font-mono text-xs text-haze">{input.length} values</span>
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="e.g. 10, 9, 2, 5, 3, 7"
          className={cn(
            'min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/60 focus:border-lime/50'
          )}
        />
        <button
          type="submit"
          aria-label="Apply values"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-mist transition hover:border-lime/50 hover:text-lime active:scale-95"
        >
          <Check size={18} />
        </button>
      </form>
      <button
        type="button"
        onClick={() => onChange(randomLisInput(input.length || 8))}
        className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-lime/50 hover:text-lime active:scale-95"
      >
        <Shuffle size={15} />
        Random values
      </button>
    </div>
  );
};
