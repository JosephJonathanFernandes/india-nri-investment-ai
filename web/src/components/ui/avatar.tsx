import * as React from 'react';
import { cn } from '@/lib/utils';

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  src?: string;
  name?: string;
  size?: 'sm' | 'default' | 'lg';
};

function Avatar({ src, name, size = 'default', className }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';
  const sizes = { sm: 'h-8 w-8 text-xs', default: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
  return (
    <div
      className={cn('flex h-full w-full items-center justify-center rounded-xl bg-navy-900 text-white font-medium', sizes[size], className)}
    >
      {src ? <img src={src} alt={name ?? 'avatar'} className="rounded-xl object-cover h-full w-full" /> : initials}
    </div>
  );
}

export default Avatar;
