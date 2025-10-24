import { ReactNode } from 'react';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
  refreshTrigger?: number;
}

export default function MainLayout({ children, refreshTrigger }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950">
      <Header refreshTrigger={refreshTrigger} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

