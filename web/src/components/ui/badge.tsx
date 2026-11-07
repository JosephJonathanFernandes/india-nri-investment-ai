import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'eligible'
    | 'restriction'
    | 'verification'
    | 'insufficient'
    | 'illustrative';
};

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
          secondary:
            'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
          destructive:
            'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90',
          outline:
            'border-input bg-transparent hover:bg-accent hover:text-accent-foreground dark:border-white/20',
          eligible:
            'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-400',
          restriction:
            'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-400',
          verification:
            'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-400',
          insufficient:
            'border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-gray-800/20 dark:text-gray-300',
          illustrative:
            'border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-900 dark:bg-purple-900/20 dark:text-purple-400',
        },
        className
      )}
      {...props}
    />
  );
}

export default Badge;
export { Badge };
