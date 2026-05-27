import type { ControlsProps } from '@/core/engine/types';
import type { StringPairInput } from './types';
import { cn } from '@/utils/cn';

const field = cn(
  'w-full rounded-xl bg-black/30 px-4 py-2.5 font-mono text-sm text-mist',
  'border border-white/10 outline-none placeholder:text-haze/60 focus:border-cyan/50'
);

const sanitize = (value: string): string =>
  value.replace(/\s+/g, '').slice(0, 10);

export const StringPairControls = ({
  input,
  onChange,
}: ControlsProps<StringPairInput>) => (
  <div className="flex flex-col gap-3">
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide text-haze">
        String A
      </span>
      <input
        className={field}
        value={input.a}
        maxLength={10}
        onChange={(event) =>
          onChange({ ...input, a: sanitize(event.target.value) })
        }
      />
    </label>
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide text-haze">
        String B
      </span>
      <input
        className={field}
        value={input.b}
        maxLength={10}
        onChange={(event) =>
          onChange({ ...input, b: sanitize(event.target.value) })
        }
      />
    </label>
    <span className="font-mono text-xs text-haze">
      up to 10 characters each
    </span>
  </div>
);
