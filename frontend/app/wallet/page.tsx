'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, Send, Plus, TrendingUp, Lock, Unlock } from 'lucide-react';
import { logger } from '@/utils/logger';

interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'fee' | 'reward';
  amount: number;
  timestamp: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function WalletPage() {
  const [balance, setBalance] = useState(100.0);
  const [lockedBalance, setLockedBalance] = useState(25.5);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([
    {
      id: '1',
      type: 'deposit',
      amount: 100,
      timestamp: new Date().toISOString(),
      description: 'Initial deposit',
      status: 'completed'
    },
    {
      id: '2',
      type: 'fee',
      amount: -25.5,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      description: 'Project execution fee',
      status: 'completed'
    }
  ]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    logger.info('WalletPage', 'Wallet page initialized', { balance, lockedBalance });
  }, []);

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      logger.warn('WalletPage', 'Invalid deposit amount', { amount });
      return;
    }

    logger.info('WalletPage', 'Processing deposit', { amount });

    const newTransaction: WalletTransaction = {
      id: Date.now().toString(),
      type: 'deposit',
      amount: amount,
      timestamp: new Date().toISOString(),
      description: 'Manual deposit',
      status: 'completed'
    };

    setBalance(balance + amount);
    setTransactions([newTransaction, ...transactions]);
    setShowDepositModal(false);
    setDepositAmount('');

    logger.success('WalletPage', 'Deposit successful', { newBalance: balance + amount });
  };

  const availableBalance = balance - lockedBalance;

  const transactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '➕';
      case 'withdrawal':
        return '➖';
      case 'fee':
        return '💸';
      case 'reward':
        return '🎁';
      default:
        return '💰';
    }
  };

  const transactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'reward':
        return 'text-green-400';
      case 'withdrawal':
      case 'fee':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Wallet size={28} className="text-primary" />
            <h1 className="text-3xl font-bold">Wallet</h1>
          </div>
          <p className="text-gray-400">Manage your HyperTask credits</p>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Total Balance */}
          <div className="glass rounded-xl p-6 border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Total Balance</span>
              <Wallet size={20} className="text-primary" />
            </div>
            <div className="text-3xl font-bold mb-2">${balance.toFixed(2)}</div>
            <div className="text-xs text-gray-500">HYPER Credits</div>
          </div>

          {/* Available Balance */}
          <div className="glass rounded-xl p-6 border border-green-400/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Available</span>
              <Unlock size={20} className="text-green-400" />
            </div>
            <div className="text-3xl font-bold mb-2 text-green-400">${availableBalance.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Ready to use</div>
          </div>

          {/* Locked Balance */}
          <div className="glass rounded-xl p-6 border border-yellow-400/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Locked</span>
              <Lock size={20} className="text-yellow-400" />
            </div>
            <div className="text-3xl font-bold mb-2 text-yellow-400">${lockedBalance.toFixed(2)}</div>
            <div className="text-xs text-gray-500">In active projects</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            Deposit
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            <Send size={20} />
            Withdraw (Coming Soon)
          </button>
        </div>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-xl p-6 max-w-md w-full border border-primary/20">
              <h2 className="text-2xl font-bold mb-4">Deposit Credits</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount (HYPER)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-dark-700 border border-primary/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="text-sm text-gray-400">
                  New balance: ${(balance + (parseFloat(depositAmount) || 0)).toFixed(2)}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDepositModal(false)}
                    className="flex-1 px-4 py-2 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeposit}
                    disabled={!depositAmount}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-primary" />
            <h2 className="text-xl font-bold">Transaction History</h2>
          </div>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="glass rounded-lg p-4 border border-primary/20 hover:border-primary/50 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{transactionIcon(tx.type)}</span>
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transactionColor(tx.type)}`}>
                    {tx.type === 'deposit' || tx.type === 'reward' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <span className="text-xs text-gray-500">{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
