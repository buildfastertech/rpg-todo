import React from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

// Pull-to-refresh functionality removed due to conflicts with native scroll behavior
export function PullToRefresh({ children }: PullToRefreshProps) {
  return <>{children}</>;
}
