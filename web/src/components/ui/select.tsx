import * as React from 'react';
import { cn } from '@/lib/utils';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

function Select({ className, label, helperText, error, id, ...props }: SelectProps) {
  return (
    <div className="w-full space-y-1">
      {label && <label className="text-sm font-medium text-navy-900 dark:text-white">{label}</label>}
      <select
        id={id}
        className={cn(
          'block w-full rounded-xl border border-input bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-navy-800 dark:text-white dark:focus:ring-white dark:focus:ring-offset-navy-900',
          error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-white/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {helperText && !error && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}

export default Select;
export { Select };
