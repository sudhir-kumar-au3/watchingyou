import { useState } from 'react';
import { Minus, Plus, Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { randomAvlOps, type AvlOp } from './avl';
import { cn } from '@/utils/cn';

export const AvlControls = ({ input, onChange }: ControlsProps<AvlOp[]>) => {
  const [draft, setDraft] = useState('');

  const append = (op: 'insert' | 'delete'): void => {
    const value = Number(draft);
    if (draft.trim() === '' || !Number.isFinite(value)) return;
    onChange([...input, { op, value }]);
    setDraft('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-h-24 flex-wrap gap-1.5 overflow-auto">
        {input.length === 0 ? (
          <span className="font-mono text-xs text-haze">No operations yet.</span>
        ) : (
          input.map((entry, index) => (
            <span
              key={`${entry.op}-${entry.value}-${index}`}
              className={cn(
                'rounded-md px-2 py-1 font-mono text-[11px]',
                entry.op === 'insert'
                  ? 'bg-cyan/15 text-cyan'
                  : 'bg-rose/15 text-rose'
              )}
            >
              {entry.op === 'insert' ? '+' : '−'}
              {entry.value}
            </span>
          ))
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={draft}
          inputMode="numeric"
          onChange={(event) => setDraft(event.target.value)}
          placeholder="value"
          className={cn(
            'min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/60',
            'focus:border-violet/50'
          )}
        />
        <button
          type="button"
          onClick={() => append('insert')}
          aria-label="Insert value"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-cyan transition hover:border-cyan/50 active:scale-95"
        >
          <Plus size={18} />
        </button>
        <button
          type="button"
          onClick={() => append('delete')}
          aria-label="Delete value"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-rose transition hover:border-rose/50 active:scale-95"
        >
          <Minus size={18} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onChange(randomAvlOps())}
        className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-violet/50 hover:text-violet active:scale-95"
      >
        <Shuffle size={15} />
        Random tree + deletes
      </button>
    </div>
  );
};
