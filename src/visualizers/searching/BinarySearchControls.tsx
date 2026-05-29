import { useState, type FormEvent } from 'react';
import { Check, Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { cn } from '@/utils/cn';
import { randomSortedInput, type SearchInput } from './types';

export const BinarySearchControls = ({
  input,
  onChange,
}: ControlsProps<SearchInput>) => {
  const [draft, setDraft] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const target = Number(draft);
    if (draft.trim() === '' || !Number.isFinite(target)) return;
    onChange({ ...input, target });
    setDraft('');
  };

  return (
    <div className="flex flex-col gap-4">
      <span className="font-mono text-xs text-haze">
        {input.array.length} sorted values · searching for {input.target}
      </span>
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={draft}
          inputMode="numeric"
          onChange={(event) => setDraft(event.target.value)}
          placeholder="target value"
          className={cn(
            'min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/60',
            'focus:border-cyan/50'
          )}
        />
        <button
          type="submit"
          aria-label="Set target"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
        >
          <Check size={18} />
        </button>
      </form>
      <button
        type="button"
        onClick={() => onChange(randomSortedInput(input.array.length))}
        className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
      >
        <Shuffle size={15} />
        New sorted array
      </button>
    </div>
  );
};
