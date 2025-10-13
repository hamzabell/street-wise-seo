'use client';

import { ReactNode, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SwipeActionsProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: ReactNode;
    label: string;
    className?: string;
  };
  rightAction?: {
    icon: ReactNode;
    label: string;
    className?: string;
  };
  threshold?: number;
  className?: string;
}

export function SwipeActions({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
  className
}: SwipeActionsProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      currentX.current = startX.current;
      setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      currentX.current = e.touches[0].clientX;
      const offset = currentX.current - startX.current;
      setDragOffset(offset);
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;

      const absOffset = Math.abs(dragOffset);

      if (absOffset > threshold) {
        if (dragOffset > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (dragOffset < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }

      setDragOffset(0);
      setIsDragging(false);
    };

    const handleMouseDown = (e: MouseEvent) => {
      startX.current = e.clientX;
      currentX.current = startX.current;
      setIsDragging(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      currentX.current = e.clientX;
      const offset = currentX.current - startX.current;
      setDragOffset(offset);
    };

    const handleMouseUp = () => {
      if (!isDragging) return;

      const absOffset = Math.abs(dragOffset);

      if (absOffset > threshold) {
        if (dragOffset > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (dragOffset < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }

      setDragOffset(0);
      setIsDragging(false);
    };

    const container = containerRef.current;
    if (!container) return;

    // Touch events for mobile
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    // Mouse events for desktop testing
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, threshold, onSwipeLeft, onSwipeRight]);

  const getOpacity = () => {
    const absOffset = Math.abs(dragOffset);
    return Math.min(absOffset / threshold, 1);
  };

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {/* Left Action Background */}
      {leftAction && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 flex items-center px-4 transition-opacity duration-200',
            leftAction.className
          )}
          style={{ opacity: dragOffset > 0 ? getOpacity() : 0 }}
        >
          <div className="flex items-center gap-2 text-white">
            {leftAction.icon}
            <span className="text-sm font-medium">{leftAction.label}</span>
          </div>
        </div>
      )}

      {/* Right Action Background */}
      {rightAction && (
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 flex items-center px-4 transition-opacity duration-200',
            rightAction.className
          )}
          style={{ opacity: dragOffset < 0 ? getOpacity() : 0 }}
        >
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm font-medium">{rightAction.label}</span>
            {rightAction.icon}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className="relative bg-white transition-transform duration-200 touch-manipulation"
        style={{
          transform: `translateX(${dragOffset}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface SwipeableCardProps {
  children: ReactNode;
  onSave?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function SwipeableCard({ children, onSave, onDelete, className }: SwipeableCardProps) {
  return (
    <SwipeActions
      onSwipeRight={onSave}
      onSwipeLeft={onDelete}
      rightAction={{
        icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>,
        label: 'Save',
        className: 'bg-green-500'
      }}
      leftAction={{
        icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>,
        label: 'Delete',
        className: 'bg-red-500'
      }}
      className={className}
    >
      {children}
    </SwipeActions>
  );
}