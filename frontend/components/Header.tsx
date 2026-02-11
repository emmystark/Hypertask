'use client';

import React from 'react';
import { Wallet, ChevronDown } from 'lucide-react';

interface HeaderProps {
  connected: boolean;
  balance: number;
  lockedBalance: number;
  address?: string;
  txHash?: string;
}

export default function Header({ connected, balance, lockedBalance, address, txHash }: HeaderProps) {
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-20 glass border-b border-primary/20">
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
        {/* Network Status */}




        <div className="flex items-center h-12 gap-2 relative  py-2 rounded-lg">
          <img className='h-56 w-60 right relative z-50' src="./logo.png" alt="" />
        </div>


        <div className="flex items-center gap-2 left-80 relative glass px-3 py-2 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-sm font-medium hidden sm:inline">Monad Devnet Connected</span>
          <span className="text-sm font-medium sm:hidden">Connected</span>
        </div>

        {/* Wallet Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {txHash && (
            <div className="hidden md:flex items-center gap-2 glass px-3 py-2 rounded-lg text-sm">
              <span className="text-gray-400">Tx:</span>
              <span className="font-mono text-secondary">{formatAddress(txHash)}</span>
            </div>
          )}

          {connected ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Balance */}
              <div className="glass px-3 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet size={16} className="text-primary" />
                  <div className="text-sm">
                    <span className="hidden sm:inline">{formatAddress(address || '')}</span>
                    <span className="sm:hidden">Wallet</span>
                    <span className="mx-1">|</span>
                    <span className="font-bold">{balance.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 ml-1">HYPER</span>
                  </div>
                </div>
              </div>

              {/* Locked Balance */}
              {lockedBalance > 0 && (
                <div className="hidden sm:block glass px-3 py-2 rounded-lg border border-accent-orange/30">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-accent-orange">🔒</span>
                    <span className="font-bold">{lockedBalance.toFixed(2)}</span>
                    <span className="text-xs text-gray-400">Locked</span>
                  </div>
                </div>
              )}

              {/* Dropdown */}
              <button className="glass p-2 rounded-lg hover:bg-primary/20 transition-colors">
                <ChevronDown size={16} />
              </button>
            </div>
          ) : (
            <button className="btn-primary text-sm sm:text-base">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
