import * as React from 'react';
import { cn } from '@/lib/utils';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 bg-white text-navy-900 shadow-sm dark:border-white/10 dark:bg-navy-800 dark:text-white',
        className
      )}
      {...props}
    />
  );
}

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;
function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  );
}

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;
function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn('text-xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;
function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  );
}

type CardContentProps = React.HTMLAttributes<HTMLDivElement>;
function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props} />
  );
}

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;
function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
