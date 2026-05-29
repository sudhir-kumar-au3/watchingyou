import { useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { cn } from '@/utils/cn';
import type { KmpInput } from './kmp';

const clean = (raw: string): string => raw.replace(/\s+/g, '').slice(0, 24);

export const KmpControls = ({ input, onChange }: ControlsProps<KmpInput>) => {
  const [text, setText] = useState('');
  const [pattern, setPattern] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const nextText = clean(text) || input.text;
    const nextPattern = clean(pattern) || input.pattern;
    if (nextPattern.length === 0) return;
    onChange({ text: nextText, pattern: nextPattern });
    setText('');
    setPattern('');
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <span className="font-mono text-xs text-haze">
        text "{input.text}" · pattern "{input.pattern}"
      </span>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-wide text-haze">Text</span>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={input.text}
          className={cn(
            'rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/50 focus:border-amber/50'
          )}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-wide text-haze">Pattern</span>
        <div className="flex items-center gap-2">
          <input
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            placeholder={input.pattern}
            className={cn(
              'min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
              'border border-white/10 outline-none placeholder:text-haze/50 focus:border-amber/50'
            )}
          />
          <button
            type="submit"
            aria-label="Apply text and pattern"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-mist transition hover:border-amber/50 hover:text-amber active:scale-95"
          >
            <Check size={18} />
          </button>
        </div>
      </label>
    </form>
  );
};
