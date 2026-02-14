'use client';

import React from 'react';
import { Plus, History, Menu, X, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logger } from '@/utils/logger';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  icon: any;
  label: string;
  href: string;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: Plus, label: 'New Task', href: '/' },
    { icon: History, label: 'History', href: '/history' },
    { icon: BookOpen, label: 'Docs', href: '/docs' },
  ];

  return (
    <>
      <div className='fixed'>
        {/* Mobile toggle button */}
      <div className='z-0'>
        <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass text-white hover:bg-primary/20 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          w-64 lg:w-20 
          bg-dark-800 border-r border-primary/20
          transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-primary/20">
          {/* <div className="flex items-center gap-3 lg:justify-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
              <span className="text-xl font-bold">H</span>
            </div>
            <span className="lg:hidden text-xl font-bold gradient-text">HyperTask</span>
          </div> */}
          <br />
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
            return (
              <div key={index}>
                <Link href={item.href}>
                  <button
                    onClick={() => {
                      logger.info('Navigation', 'Navigated to page', { page: item.label, href: item.href });
                      onToggle(); // Close sidebar on mobile
                    }}
                    className={`
                      w-full flex items-center gap-3 lg:justify-center
                      p-3 rounded-lg transition-all duration-300
                      ${isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/50' 
                        : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                      }
                      `}
                  >
                    <item.icon size={20} />
                  </button>
                </Link>
                <span className=" lg:text-xs whitespace-nowrap center text-center font-bold">{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Bottom section - visible on desktop only */}
        <div className="hidden lg:block absolute bottom-0 left-0 right-0 p-4 border-t border-primary/20">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto" />
        </div>
      </aside>
      </div>
      </div>
    </>
  );
}
