import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  strong?: boolean;
}

export const Panel = ({
  children,
  strong = false,
  className,
  ...rest
}: PanelProps) => (
  <div
    className={cn(
      strong ? 'glass-strong' : 'glass',
      'rounded-2xl',
      className
    )}
    {...rest}
  >
    {children}
  </div>
);
