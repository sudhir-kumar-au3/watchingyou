import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  label: string;
  accent?: string;
}

export const Select = ({
  value,
  options,
  onChange,
  label,
  accent,
}: SelectProps) => (
  <div className="relative">
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        'w-full cursor-pointer appearance-none rounded-xl bg-black/30 py-2.5 pl-4 pr-10',
        'border border-white/10 font-display text-sm text-mist outline-none',
        'transition focus:border-cyan/60'
      )}
      style={accent ? { borderColor: `${accent}55` } : undefined}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-abyss">
          {option.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-haze"
    />
  </div>
);
