'use client';

import React, { useState } from 'react';
import { X, Download, Copy, CheckCircle2, Star, ExternalLink, Lock } from 'lucide-react';
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

  // Check if payment has been released
  const paymentReleased = transaction.status === 'completed';
  const totalReleased = transaction.total - transaction.burnFee;

  const handleDownload = (deliverable: Deliverable) => {
    if (!paymentReleased) {
      alert('Payment must be released before downloading deliverables');
      return;
    }

    if (deliverable.type === 'image' && deliverable.content) {
      const link = document.createElement('a');
      link.href = deliverable.content;
      link.download = deliverable.name || 'logo.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (deliverable.type === 'text' && deliverable.content) {
      const blob = new Blob([deliverable.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = deliverable.name ? `${deliverable.name}.txt` : 'copy.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopy = (text: string) => {
    if (!paymentReleased) {
      alert('Payment must be released before copying deliverables');
      return;
    }
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fadeIn">
      <div className="glass rounded-3xl border-2 border-primary/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto fade-in">
        {/* Header */}
        <div className="sticky top-0 glass backdrop-blur-xl border-b border-primary/20 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              paymentReleased ? 'bg-accent-green/20' : 'bg-accent-orange/20'
            }`}>
              {paymentReleased ? (
                <CheckCircle2 className="text-accent-green" size={24} />
              ) : (
                <Lock className="text-accent-orange" size={24} />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {paymentReleased ? 'Project Complete!' : 'Review Complete - Release Payment'}
              </h2>
              {!paymentReleased && (
                <p className="text-sm text-gray-400 mt-1">Release payment to download deliverables</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Status Banner */}
          {!paymentReleased && (
            <div className="glass rounded-xl p-4 bg-accent-orange/10 border border-accent-orange/30">
              <div className="flex items-start gap-3">
                <Lock className="text-accent-orange mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <div className="font-semibold text-accent-orange">Payment Required</div>
                  <div className="text-sm text-gray-300 mt-1">
                    You must release the escrowed payment ({transaction.total} HYPER) before you can download or copy the deliverables.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verified Transaction Badge */}
          {paymentReleased && (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border border-accent-green/30 bg-accent-green/10">
                <div className="w-6 h-6 rounded bg-accent-green/20 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-accent-green" />
                </div>
                <span className="text-sm font-medium text-accent-green">Payment Released - Transaction Verified</span>
              </div>
            </div>
          )}

          {/* Deliverables */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Deliverables</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {deliverables.map((deliverable) => (
                <div key={deliverable.id} className="glass rounded-xl p-4 space-y-3 relative">
                  {/* Lock Overlay for Unpaid */}
                  {!paymentReleased && (
                    <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                      <div className="text-center">
                        <Lock className="text-gray-400 mx-auto mb-2" size={32} />
                        <div className="text-sm text-gray-400">Release payment to unlock</div>
                      </div>
                    </div>
                  )}

                  {deliverable.type === 'image' && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-dark-700">
                      <img
                        src={deliverable.content}
                        alt={deliverable.name}
                        className={`w-full h-full object-cover ${!paymentReleased ? 'blur-md' : ''}`}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {deliverable.name}
                      {paymentReleased && (
                        <CheckCircle2 size={14} className="text-accent-green" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDownload(deliverable)}
                        disabled={!paymentReleased}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                          paymentReleased 
                            ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 shadow-lg shadow-primary/30' 
                            : 'bg-dark-700/50 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {paymentReleased ? <Download size={14} /> : <Lock size={14} />}
                        Download
                      </button>
                      {deliverable.type === 'text' && (
                        <button
                          onClick={() => handleCopy(deliverable.content)}
                          disabled={!paymentReleased}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                            paymentReleased
                              ? 'bg-dark-700 hover:bg-primary/20'
                              : 'bg-dark-700/50 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {!paymentReleased ? <Lock size={14} /> : copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {deliverable.type === 'text' && (
                    <div className={`glass rounded-lg p-3 text-sm text-gray-300 bg-dark-800/50 max-h-32 overflow-y-auto ${
                      !paymentReleased ? 'blur-sm' : ''
                    }`}>
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
                <span className="text-gray-400">Total Escrowed:</span>
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
                  <span className="text-accent-orange"></span>
                  {transaction.burnFee} HYPER
                </span>
              </div>
              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-semibold ${paymentReleased ? 'text-accent-green' : 'text-accent-orange'}`}>
                    {paymentReleased ? '✓ Released to Agents' : '⏳ Pending Release'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Monad Explorer Link */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Blockchain Transaction</span>
              <span className="text-xs text-gray-400">Network: Monad</span>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Escrow Contract:</div>
              <div className="font-mono text-sm text-secondary break-all bg-dark-800/50 p-2 rounded">
                {transaction.txHash || '0xA1B2C3D4E5F6...89AB'}
              </div>
              <button className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors">
                <ExternalLink size={14} />
                View on Monad Explorer
              </button>
              {paymentReleased && (
                <div className="text-xs font-medium text-accent-green mt-2 flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  Payment Released: {totalReleased.toFixed(1)} HYPER distributed to agents
                </div>
              )}
            </div>
          </div>

          {/* Rate Agents (Only after payment) */}
          {paymentReleased && (
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
                          className="transition-all hover:scale-110"
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
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
            {paymentReleased ? (
              <>
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
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full btn-secondary"
              >
                Back to Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}