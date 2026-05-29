import { useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { cn } from '@/utils/cn';
import type { HuffmanInput } from './huffman';

export const HuffmanControls = ({ input, onChange }: ControlsProps<HuffmanInput>) => {
  const [draft, setDraft] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const text = draft.replace(/\s+/g, '').slice(0, 16);
    if (text.length >= 2) {
      onChange({ text });
      setDraft('');
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <span className="font-mono text-xs text-haze">encoding "{input.text}"</span>
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={input.text}
          className={cn(
            'min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/50 focus:border-amber/50'
          )}
        />
        <button
          type="submit"
          aria-label="Encode text"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-mist transition hover:border-amber/50 hover:text-amber active:scale-95"
        >
          <Check size={18} />
        </button>
      </div>
      <span className="font-mono text-[11px] text-haze/60">
        frequent letters get shorter codes
      </span>
    </form>
  );
};
