import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-[#eaeaea] rounded-2xl bg-white", className)}>
      <div className="bg-[#f5f5f5] p-4 rounded-full mb-5">
        <Icon className="h-8 w-8 text-[#888888]" />
      </div>
      <h3 className="text-lg font-semibold text-[#111111] tracking-tight mb-2">{title}</h3>
      <p className="text-[#666666] text-sm max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="default">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
