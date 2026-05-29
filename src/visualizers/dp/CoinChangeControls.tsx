import { useState, type FormEvent } from 'react';
import { Check, Shuffle } from 'lucide-react';
import type { ControlsProps } from '@/core/engine/types';
import { cn } from '@/utils/cn';
import { randomCoinInput, type CoinInput } from './coinChange';

const parseCoins = (raw: string): number[] =>
  raw
    .split(/[\s,]+/)
    .map((token) => Number(token))
    .filter((value) => Number.isInteger(value) && value > 0)
    .slice(0, 5);

export const CoinChangeControls = ({ input, onChange }: ControlsProps<CoinInput>) => {
  const [coins, setCoins] = useState('');
  const [amount, setAmount] = useState('');

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const nextCoins = parseCoins(coins);
    const nextAmount = Number(amount);
    onChange({
      coins: nextCoins.length > 0 ? nextCoins : input.coins,
      amount: Number.isInteger(nextAmount) && nextAmount >= 0 ? nextAmount : input.amount,
    });
    setCoins('');
    setAmount('');
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <span className="font-mono text-xs text-haze">
        coins [{input.coins.join(', ')}] · amount {input.amount}
      </span>
      <input
        value={coins}
        onChange={(event) => setCoins(event.target.value)}
        placeholder={`coins e.g. ${input.coins.join(', ')}`}
        className={cn(
          'rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
          'border border-white/10 outline-none placeholder:text-haze/50 focus:border-amber/50'
        )}
      />
      <div className="flex items-center gap-2">
        <input
          value={amount}
          inputMode="numeric"
          onChange={(event) => setAmount(event.target.value)}
          placeholder={`amount e.g. ${input.amount}`}
          className={cn(
            'min-w-0 flex-1 rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
            'border border-white/10 outline-none placeholder:text-haze/50 focus:border-amber/50'
          )}
        />
        <button
          type="submit"
          aria-label="Apply coins and amount"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass text-mist transition hover:border-amber/50 hover:text-amber active:scale-95"
        >
          <Check size={18} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onChange(randomCoinInput())}
        className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-mist transition hover:border-amber/50 hover:text-amber active:scale-95"
      >
        <Shuffle size={15} />
        Random coins
      </button>
    </form>
  );
};
