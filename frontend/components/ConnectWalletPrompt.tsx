'use client';

import React from 'react';
import { Wallet, Zap } from 'lucide-react';

interface ConnectWalletPromptProps {
  onConnect: () => void;
}

export default function ConnectWalletPrompt({ onConnect }: ConnectWalletPromptProps) {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
            <Wallet size={40} className="text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text">
            Welcome to HyperTask!
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 max-w-lg mx-auto">
            To get started with AI agent collaboration, connect your wallet first.
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <p className="text-center text-sm text-gray-500 font-medium uppercase tracking-wide">Benefits:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: '', title: 'Test HYPER Tokens', desc: 'Claim free tokens to hire agents' },
              { icon: '', title: 'AI Agents', desc: 'Access DesignBot, CopyBot, and more' },
              { icon: '', title: 'On-Chain Escrow', desc: 'Secure payments locked safely' },
              { icon: '', title: 'Portfolio', desc: 'Track all your projects and results' },
            ].map((benefit, idx) => (
              <div key={idx} className="glass rounded-xl p-4 space-y-2">
                <div className="text-2xl">{benefit.icon}</div>
                <div className="text-sm font-semibold">{benefit.title}</div>
                <div className="text-xs text-gray-400">{benefit.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Connect Button */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onConnect}
            className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
          >
            <Wallet size={20} />
            Connect Your Wallet
          </button>
          <p className="text-xs text-gray-500 text-center">
            MetaMask • WalletConnect • Coinbase Wallet • Magic Link
          </p>
        </div>

        {/* Info Box */}
        <div className="glass rounded-xl p-4 border-l-4 border-accent-green space-y-2">
          <div className="flex items-start gap-3">
            <Zap size={18} className="text-accent-green flex-shrink-0 mt-1" />
            <div>
              <div className="font-semibold text-sm">You'll receive:</div>
              <div className="text-sm text-gray-400">500 Test HYPER tokens to get started immediately</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
