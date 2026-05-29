import { useState, type FormEvent } from 'react';
import { Check, Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { cn } from '@/utils/cn';
import { randomFactorInput } from './factorize';

export const FactorizeControls = ({ input, onChange }: ControlsProps<number>) => {
  const [draft, setDraft] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const value = Number(draft);
    if (Number.isInteger(value) && value >= 2 && value <= 99999) {
      onChange(value);
      setDraft('');
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <span className="font-mono text-xs text-haze">factorizing {input}</span>
      <div className="flex items-center gap-2">
        <input
          value={draft}
          inputMode="numeric"
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`number e.g. ${input}`}
          className={cn(
            'min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/50 focus:border-violet/50'
          )}
        />
        <button
          type="submit"
          aria-label="Factorize"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-mist transition hover:border-violet/50 hover:text-violet active:scale-95"
        >
          <Check size={18} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onChange(randomFactorInput())}
        className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-violet/50 hover:text-violet active:scale-95"
      >
        <Shuffle size={15} />
        Random number
      </button>
    </form>
  );
};
