'use client';

import React, { useState } from 'react';
import { X, Download, Copy, CheckCircle2, Star, ExternalLink } from 'lucide-react';
import { Deliverable, Transaction } from '@/types';

interface ProjectCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliverables: Deliverable[];
  transaction: Transaction;
  onStartNew: () => void;
}

export default function ProjectCompleteModal({
  isOpen,
  onClose,
  deliverables,
  transaction,
  onStartNew
}: ProjectCompleteModalProps) {
  const [rating, setRating] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalReleased = transaction.total - transaction.burnFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fadeIn">
      <div className="glass rounded-3xl border-2 border-primary/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto fade-in">
        {/* Header */}
        <div className="sticky top-0 glass backdrop-blur-xl border-b border-primary/20 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center">
              <CheckCircle2 className="text-accent-green" size={24} />
            </div>
            <h2 className="text-2xl font-bold">Project Complete!</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Verified Transaction Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border border-primary/30">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                <span className="text-sm">✓</span>
              </div>
              <span className="text-sm font-medium">Verified Monad Transaction</span>
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Deliverables</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {deliverables.map((deliverable) => (
                <div key={deliverable.id} className="glass rounded-xl p-4 space-y-3">
                  {deliverable.type === 'image' && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-dark-700">
                      <img
                        src={deliverable.content}
                        alt={deliverable.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="font-semibold text-sm">{deliverable.name}</div>
                    <div className="flex gap-2">
                      {deliverable.downloadUrl && (
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-dark-700 hover:bg-primary/20 transition-colors text-sm">
                          <Download size={14} />
                          Download
                        </button>
                      )}
                      {deliverable.type === 'text' && (
                        <>
                          <button
                            onClick={() => handleCopy(deliverable.content)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-dark-700 hover:bg-primary/20 transition-colors text-sm"
                          >
                            <Copy size={14} />
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                          <button className="px-3 py-2 rounded-lg bg-dark-700 hover:bg-primary/20 transition-colors text-sm">
                            Export (.txt)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {deliverable.type === 'text' && (
                    <div className="glass rounded-lg p-3 text-sm text-gray-300 bg-dark-800/50">
                      {deliverable.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Transaction Summary</h3>
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-gray-400">Total:</span>
                <span className="font-bold text-accent-green">{transaction.total} HYPER</span>
              </div>
              {transaction.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.agent}:</span>
                  <span className="font-medium">{item.amount} HYPER</span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Burn Fee (5%):</span>
                <span className="font-medium flex items-center gap-1">
                  <span className="text-accent-orange">🔥</span>
                  {transaction.burnFee} HYPER
                </span>
              </div>
            </div>
          </div>

          {/* Monad Explorer Link */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Transaction Preview</span>
              <span className="text-xs text-gray-400">Network: Monad</span>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Escrow Contract:</div>
              <div className="font-mono text-sm text-secondary break-all">
                {transaction.txHash || '0xA1...9D3'}
              </div>
              <button className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors">
                <ExternalLink size={14} />
                Monad Explorer
              </button>
              <div className="text-xs text-gray-400 mt-2">
                Pending Release Tx: Awaiting Signature
              </div>
              <div className="text-xs font-medium text-accent-green">
                Total Released: {totalReleased.toFixed(1)} HYPER
              </div>
            </div>
          </div>

          {/* Rate Agents */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Rate the agents:</h3>
            <div className="flex flex-wrap gap-3">
              {transaction.breakdown.map((agent, index) => (
                <div key={index} className="flex items-center gap-2 glass px-4 py-2 rounded-lg">
                  <span className="text-sm">
                    {agent.agent === 'DesignBot' ? '🎨' : '📝'} {agent.agent}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-colors hover:scale-110"
                      >
                        <Star
                          size={16}
                          className={star <= rating ? 'fill-accent-orange text-accent-orange' : 'text-gray-600'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={onStartNew}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Start New Task
            </button>
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
