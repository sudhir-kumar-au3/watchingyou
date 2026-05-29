import { useState, type FormEvent } from 'react';
import { Check, Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { cn } from '@/utils/cn';
import { randomFastPowInput, type FastPowInput } from './fastPow';

export const FastPowControls = ({ input, onChange }: ControlsProps<FastPowInput>) => {
  const [base, setBase] = useState('');
  const [exp, setExp] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const nb = Number(base);
    const ne = Number(exp);
    onChange({
      base: Number.isInteger(nb) && nb >= 1 && nb <= 12 ? nb : input.base,
      exp: Number.isInteger(ne) && ne >= 0 && ne <= 20 ? ne : input.exp,
    });
    setBase('');
    setExp('');
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <span className="font-mono text-xs text-haze">
        {input.base}^{input.exp}
      </span>
      <div className="flex items-center gap-2">
        <input
          value={base}
          inputMode="numeric"
          onChange={(event) => setBase(event.target.value)}
          placeholder={`base ${input.base}`}
          className={cn(
            'min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/50 focus:border-amber/50'
          )}
        />
        <input
          value={exp}
          inputMode="numeric"
          onChange={(event) => setExp(event.target.value)}
          placeholder={`exp ${input.exp}`}
          className={cn(
            'min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/50 focus:border-amber/50'
          )}
        />
        <button
          type="submit"
          aria-label="Apply base and exponent"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-mist transition hover:border-amber/50 hover:text-amber active:scale-95"
        >
          <Check size={18} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onChange(randomFastPowInput())}
        className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-amber/50 hover:text-amber active:scale-95"
      >
        <Shuffle size={15} />
        Random base & exponent
      </button>
    </form>
  );
};
