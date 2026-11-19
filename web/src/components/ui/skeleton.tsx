import * as React from 'react';
import { cn } from '@/lib/utils';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'text' | 'circle' | 'rect';
};

function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-white/10',
        variant === 'text' ? 'h-4 w-full' : variant === 'circle' ? 'h-8 w-8 rounded-full' : 'h-16 w-full',
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
