import PullToRefreshLib from 'react-simple-pull-to-refresh';

interface PullToRefreshWrapperProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshWrapperProps) {
  return (
    <PullToRefreshLib
      onRefresh={onRefresh}
      pullingContent=""
      isPullable={!disabled}
      className="h-full"
    >
      {children}
    </PullToRefreshLib>
  );
}
