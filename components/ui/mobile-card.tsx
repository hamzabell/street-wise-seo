'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  isPressable?: boolean;
  onPress?: () => void;
}

export function MobileCard({
  children,
  className,
  title,
  description,
  action,
  isPressable = false,
  onPress
}: MobileCardProps) {
  const Component = isPressable ? 'button' : 'div';

  return (
    <Component
      className={cn(
        'w-full transition-all duration-200',
        isPressable && 'active:scale-[0.98] active:bg-gray-50'
      )}
      onClick={onPress}
    >
      <Card className={cn(
        'border-0 shadow-sm hover:shadow-md transition-shadow duration-200',
        'touch-manipulation', // Optimizes for touch
        className
      )}>
        {(title || description || action) && (
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                {title && (
                  <CardTitle className="text-base sm:text-lg leading-tight">
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              {action && (
                <div className="ml-2 flex-shrink-0">
                  {action}
                </div>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </Card>
    </Component>
  );
}

interface MobileListItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  isPressable?: boolean;
  showChevron?: boolean;
}

export function MobileListItem({
  children,
  className,
  onClick,
  isPressable = true,
  showChevron = false
}: MobileListItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={!isPressable}
      className={cn(
        'w-full text-left transition-all duration-200 touch-manipulation',
        'active:scale-[0.98] active:bg-gray-50',
        isPressable && 'hover:bg-gray-50',
        'p-4 rounded-lg border border-gray-200 bg-white',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          {children}
        </div>
        {showChevron && (
          <div className="ml-3 flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}