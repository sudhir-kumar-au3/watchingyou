import { useState, type FormEvent } from 'react';
import { Check, Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { cn } from '@/utils/cn';
import { randomGcdInput, type GcdInput } from './gcd';

export const GcdControls = ({ input, onChange }: ControlsProps<GcdInput>) => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const na = Number(a);
    const nb = Number(b);
    onChange({
      a: Number.isInteger(na) && na > 0 ? na : input.a,
      b: Number.isInteger(nb) && nb > 0 ? nb : input.b,
    });
    setA('');
    setB('');
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <span className="font-mono text-xs text-haze">
        gcd({input.a}, {input.b})
      </span>
      <div className="flex items-center gap-2">
        <input
          value={a}
          inputMode="numeric"
          onChange={(event) => setA(event.target.value)}
          placeholder={`a = ${input.a}`}
          className={cn(
            'min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/50 focus:border-cyan/50'
          )}
        />
        <input
          value={b}
          inputMode="numeric"
          onChange={(event) => setB(event.target.value)}
          placeholder={`b = ${input.b}`}
          className={cn(
            'min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/50 focus:border-cyan/50'
          )}
        />
        <button
          type="submit"
          aria-label="Apply a and b"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
        >
          <Check size={18} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onChange(randomGcdInput())}
        className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
      >
        <Shuffle size={15} />
        Random pair
      </button>
    </form>
  );
};
