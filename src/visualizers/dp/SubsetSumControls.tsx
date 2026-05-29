import { useState, type FormEvent } from 'react';
import { Check, Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { cn } from '@/utils/cn';
import { randomSubsetInput, type SubsetInput } from './subsetSum';

const parseValues = (raw: string): number[] =>
  raw
    .split(/[\s,]+/)
    .map((token) => Number(token))
    .filter((value) => Number.isInteger(value) && value > 0)
    .slice(0, 6);

export const SubsetSumControls = ({ input, onChange }: ControlsProps<SubsetInput>) => {
  const [values, setValues] = useState('');
  const [target, setTarget] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const nextValues = parseValues(values);
    const nextTarget = Number(target);
    onChange({
      values: nextValues.length > 0 ? nextValues : input.values,
      target: Number.isInteger(nextTarget) && nextTarget >= 0 ? nextTarget : input.target,
    });
    setValues('');
    setTarget('');
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <span className="font-mono text-xs text-haze">
        items [{input.values.join(', ')}] · target {input.target}
      </span>
      <input
        value={values}
        onChange={(event) => setValues(event.target.value)}
        placeholder={`items e.g. ${input.values.join(', ')}`}
        className={cn(
          'rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
          'border border-white/10 outline-none placeholder:text-haze/50 focus:border-violet/50'
        )}
      />
      <div className="flex items-center gap-2">
        <input
          value={target}
          inputMode="numeric"
          onChange={(event) => setTarget(event.target.value)}
          placeholder={`target e.g. ${input.target}`}
          className={cn(
            'min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/50 focus:border-violet/50'
          )}
        />
        <button
          type="submit"
          aria-label="Apply items and target"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-mist transition hover:border-violet/50 hover:text-violet active:scale-95"
        >
          <Check size={18} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onChange(randomSubsetInput())}
        className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-violet/50 hover:text-violet active:scale-95"
      >
        <Shuffle size={15} />
        Random items
      </button>
    </form>
  );
};
