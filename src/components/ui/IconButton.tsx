import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
  variant?: 'ghost' | 'primary';
  size?: 'md' | 'lg';
}

export const IconButton = ({
  children,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  ...rest
}: IconButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cn(
      'inline-flex items-center justify-center rounded-xl transition',
      'disabled:cursor-not-allowed disabled:opacity-30',
      size === 'lg' ? 'h-14 w-14' : 'h-11 w-11',
      variant === 'primary'
        ? 'bg-cyan text-void shadow-glow hover:brightness-110 active:scale-95'
        : 'glass text-mist hover:border-cyan/50 hover:text-cyan active:scale-95',
      className
    )}
    {...rest}
  >
    {children}
  </button>
);
