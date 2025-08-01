
"use client";

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ShortcutButtonProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

const ShortcutButton = ({ icon: Icon, label, href, onClick, className }: ShortcutButtonProps) => {
  const content = (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="outline"
        className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-card hover:bg-primary/10 border-2 border-border hover:border-primary transition-all duration-300 group"
        onClick={onClick}
        aria-label={label}
      >
        <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground group-hover:text-primary transition-colors" />
      </Button>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={cn('text-center', className)}>
        {content}
      </Link>
    );
  }

  return (
     <div className={cn('text-center', className)}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
     >
      {content}
    </div>
  );
};

export default ShortcutButton;
