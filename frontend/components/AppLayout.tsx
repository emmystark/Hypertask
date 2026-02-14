'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { logger } from '@/utils/logger';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(true);
  const [balance, setBalance] = useState(100.0);
  const [lockedBalance, setLockedBalance] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    logger.info('AppLayout', 'Page navigation', { pathname });
  }, [pathname]);

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'New Task';
      case '/history':
        return 'Project History';
      case '/wallet':
        return 'Wallet';
      case '/docs':
        return 'Documentation';
      case '/usage-guide':
        return 'Usage Guide';
      default:
        return 'HyperTask';
    }
  };

  return (
    <div className="min-h-screen flex animated-bg cyber-grid-bg">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Header
          connected={walletConnected}
          balance={balance}
          lockedBalance={lockedBalance}
          address="XXX...YYYY"
          txHash={undefined}
        />

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
