import * as React from 'react';
import { cn } from '@/lib/utils';

type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

function Separator({ className, orientation = 'horizontal', ...props }: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'shrink-0 border-gray-200 dark:border-white/10',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  );
}

export default Separator;
export { Separator };
