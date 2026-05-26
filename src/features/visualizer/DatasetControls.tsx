import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Check, Shuffle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DatasetControlsProps {
  size: number;
  minSize: number;
  maxSize: number;
  onSizeChange: (size: number) => void;
  onShuffle: () => void;
  onCustom: (values: number[]) => void;
}

const parseValues = (raw: string): number[] =>
  raw
    .split(/[\s,]+/)
    .map((token) => Number(token))
    .filter((value) => Number.isFinite(value) && value > 0)
    .slice(0, 60);

export const DatasetControls = ({
  size,
  minSize,
  maxSize,
  onSizeChange,
  onShuffle,
  onCustom,
}: DatasetControlsProps) => {
  const [draft, setDraft] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const values = parseValues(draft);
    if (values.length >= 2) {
      onCustom(values);
      setDraft('');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <label className="flex flex-1 flex-col gap-2">
          <span className="flex items-center justify-between text-xs uppercase tracking-wide text-haze">
            Array size
            <span className="font-mono text-cyan">{size}</span>
          </span>
          <input
            type="range"
            min={minSize}
            max={maxSize}
            value={size}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onSizeChange(Number(event.target.value))
            }
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-edge outline-none"
          />
        </label>
        <button
          type="button"
          onClick={onShuffle}
          className={cn(
            'mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5',
            'glass text-sm text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95'
          )}
        >
          <Shuffle size={15} />
          Shuffle
        </button>
      </div>

      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Custom values e.g. 42, 8, 15, 16, 23"
          className={cn(
            'flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/60',
            'focus:border-cyan/50'
          )}
        />
        <button
          type="submit"
          aria-label="Apply custom values"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
        >
          <Check size={18} />
        </button>
      </form>
    </div>
  );
};
