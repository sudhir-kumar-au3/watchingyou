import { useState, type FormEvent } from 'react';
import { Check, Search } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { cn } from '@/utils/cn';
import type { TrieInput } from './trie';

const parseWords = (raw: string): string[] =>
  raw
    .split(/[\s,]+/)
    .map((token) => token.trim().toLowerCase())
    .filter((token) => /^[a-z]+$/.test(token))
    .slice(0, 8);

export const TrieControls = ({ input, onChange }: ControlsProps<TrieInput>) => {
  const [words, setWords] = useState('');
  const [query, setQuery] = useState('');

  const applyWords = (event: FormEvent): void => {
    event.preventDefault();
    const parsed = parseWords(words);
    if (parsed.length >= 1) {
      onChange({ words: parsed, query: input.query });
      setWords('');
    }
  };

  const applyQuery = (event: FormEvent): void => {
    event.preventDefault();
    onChange({ ...input, query: query.trim().toLowerCase() });
    setQuery('');
  };

  return (
    <div className="flex flex-col gap-4">
      <span className="font-mono text-xs text-haze">
        {input.words.length} words · searching "{input.query}"
      </span>
      <form onSubmit={applyWords} className="flex items-center gap-2">
        <input
          value={words}
          onChange={(event) => setWords(event.target.value)}
          placeholder="words e.g. cat, car, dog"
          className={cn(
            'min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/60 focus:border-cyan/50'
          )}
        />
        <button
          type="submit"
          aria-label="Set words"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
        >
          <Check size={18} />
        </button>
      </form>
      <form onSubmit={applyQuery} className="flex items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="search a word"
          className={cn(
            'min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/60 focus:border-cyan/50'
          )}
        />
        <button
          type="submit"
          aria-label="Search word"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-mist transition hover:border-cyan/50 hover:text-cyan active:scale-95"
        >
          <Search size={18} />
        </button>
      </form>
    </div>
  );
};
