import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'navy' | 'emerald' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  asChild?: boolean;
}

function Button({ className, variant = 'default', size = 'default', asChild, ...props }: ButtonProps) {
  const Comp = asChild ? 'a' : 'button';
  return (
    <Comp
      type={asChild ? undefined : 'button'}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 dark:focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50',
        {
          default: 'bg-white text-navy-900 border border-gray-200 hover:bg-gray-50 dark:bg-navy-800 dark:text-white dark:border-white/10 dark:hover:bg-white/5',
          navy: 'bg-navy-900 text-white hover:bg-navy-800 dark:bg-white dark:text-navy-900 dark:hover:bg-gray-200',
          emerald: 'bg-emerald-600 text-white hover:bg-emerald-700',
          outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground dark:border-white/20 dark:text-white dark:hover:bg-white/10',
          ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-white/10',
          destructive: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-900 dark:hover:red-800',
        },
        {
          default: 'h-10 px-4 py-2',
          sm: 'h-9 rounded-md px-3',
          lg: 'h-11 rounded-xl px-8',
        }[size],
        className
      )}
      {...(props as Record<string, any>)}
    />
  );
}

export default Button;
export { Button };
