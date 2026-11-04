import * as React from 'react';
import { cn } from '@/lib/utils';
import { Menu } from '@headlessui/react';

type DropdownMenuProps = {
  children: React.ReactNode;
};

function DropdownMenuTrigger({ className, ...props }: any) {
  return (
    <Menu.Button className={cn('inline-flex items-center rounded-xl border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-navy-900 focus:ring-offset-2 disabled:opacity-50 dark:border-white/20 dark:bg-navy-800 dark:text-white dark:focus:ring-white', className)} {...props} />
  );
}

type DropdownMenuContentProps = {
  children: React.ReactNode;
  className?: string;
};
function DropdownMenuContent({ children, className }: DropdownMenuContentProps) {
  return (
    <Menu.Items className={cn('z-50 min-w-[12rem] overflow-hidden rounded-xl border border-white/50 bg-white p-1 text-navy-900 shadow-lg dark:border-white/20 dark:bg-navy-800 dark:text-white', className)}>
      {children}
    </Menu.Items>
  );
}

type DropdownMenuItemProps = React.HTMLAttributes<HTMLDivElement> & {
  disabled?: boolean;
};
function DropdownMenuItem({ className, disabled, children, ...props }: DropdownMenuItemProps) {
  return (
    <Menu.Item disabled={disabled}>
      {({ active }) => (
        <div className={cn('relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors', disabled && 'pointer-events-none opacity-50', active ? 'bg-accent' : '', className)} {...props}>
          {children}
        </div>
      )}
    </Menu.Item>
  );
}

type DropdownMenuLabelProps = React.HTMLAttributes<HTMLDivElement>;
function DropdownMenuLabel({ className, ...props }: DropdownMenuLabelProps) {
  return (
    <div className={cn('px-3 py-1.5 text-xs font-semibold text-muted-foreground', className)} {...props} />
  );
}

type DropdownMenuSeparatorProps = React.HTMLAttributes<HTMLDivElement>;
function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return (
    <div className={cn('-mx-1 h-[1px] bg-gray-200 dark:bg-white/10 my-1', className)} />
  );
}

function DropdownMenu({ children }: DropdownMenuProps) {
  return (
    <Menu as="div" className="relative inline-block z-50">
      {children}
    </Menu>
  );
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator };
