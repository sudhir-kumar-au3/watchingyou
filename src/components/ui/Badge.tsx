import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: ReactNode;
  accent?: string;
  className?: string;
}

export const Badge = ({ children, accent, className }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1',
      'text-xs font-medium tracking-wide uppercase',
      'border border-white/10 bg-white/5 text-haze',
      className
    )}
    style={
      accent
        ? { color: accent, borderColor: `${accent}55`, background: `${accent}14` }
        : undefined
    }
  >
    {children}
  </span>
);
