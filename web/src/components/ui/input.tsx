import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

function Input({ className, type, ...props }: InputProps & { type?: string }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm shadow-sm file:border-0 file:px-0 file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-navy-800 dark:border-white/20 dark:text-white dark:placeholder-gray-400 dark:focus-visible:ring-white dark:focus-visible:ring-offset-navy-900',
        className
      )}
      {...props}
    />
  );
}

export default Input;
export { Input };
