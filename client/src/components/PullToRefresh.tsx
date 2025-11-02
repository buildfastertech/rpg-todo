import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80; // Distance to trigger refresh
  const maxPullDistance = 150;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start if we're at the top of the scroll container
      if (container.scrollTop === 0 && !isRefreshing) {
        touchStartY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY.current;

      if (distance > 0 && container.scrollTop === 0) {
        // Prevent default scrolling when pulling down
        e.preventDefault();
        // Use progressive resistance for natural feel
        let easedDistance: number;
        if (distance <= threshold) {
          // Normal pull up to threshold
          easedDistance = distance * 0.6;
        } else {
          // Increased resistance after threshold
          const extraDistance = distance - threshold;
          easedDistance = (threshold * 0.6) + (extraDistance * 0.2);
        }
        setPullDistance(Math.min(easedDistance, maxPullDistance));
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      setIsPulling(false);

      if (pullDistance >= (threshold * 0.6) && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(threshold * 0.6);
        
        try {
          await onRefresh();
        } finally {
          // Smooth transition back
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 300);
        }
      } else {
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing, onRefresh, disabled]);

  const thresholdAdjusted = threshold * 0.6; // Adjusted for easing
  const progress = Math.min(pullDistance / thresholdAdjusted, 1);
  const rotation = progress * 360;
  const scale = 0.5 + (progress * 0.5); // Scale from 0.5 to 1
  const indicatorY = Math.max(pullDistance - 20, 0);

  // Determine if we're ready to refresh
  const isReady = pullDistance >= thresholdAdjusted && !isRefreshing;

  return (
    <div ref={containerRef} className="relative h-full overflow-auto">
      {/* Pull indicator - positioned above content, visible during pull */}
      <div
        className="sticky top-0 left-0 right-0 z-50 pointer-events-none flex items-center justify-center"
        style={{
          height: pullDistance > 0 ? `${Math.min(pullDistance + 20, 100)}px` : '0px',
          opacity: pullDistance > 0 ? Math.min(progress * 1.5, 1) : 0,
          transition: isPulling ? 'none' : 'all 150ms ease-out',
          overflow: 'visible',
        }}
      >
        <div
          className="relative"
          style={{
            transform: `scale(${scale}) translateY(${Math.min(pullDistance * 0.3, 10)}px)`,
            width: '48px',
            height: '48px',
          }}
        >
          {/* Background circle */}
          <div 
            className="absolute inset-0 rounded-full bg-white dark:bg-neutral-800 shadow-lg"
          />
          
          {/* Progress ring */}
          <svg className="absolute inset-0" width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-slate-200 dark:text-neutral-700"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-primary transition-all duration-150 ease-out"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress)}`}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isRefreshing ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : isReady ? (
              <Loader2 
                className="h-5 w-5 text-primary transition-all duration-150"
              />
            ) : (
              <ArrowDown
                className="h-5 w-5 text-slate-600 dark:text-slate-400 transition-all duration-150"
                style={{
                  transform: `rotate(${rotation}deg)`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}

