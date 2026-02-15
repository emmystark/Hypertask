'use client';

import React from 'react';
import { X, Download, Copy, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { Deliverable, Transaction } from '@/types';

interface ReviewDeliverablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliverables: Deliverable[];
  transaction: Transaction;
  onApprove: () => void;
  onRevision: () => void;
  onReject: () => void;
}

export default function ReviewDeliverablesModal({
  isOpen,
  onClose,
  deliverables,
  transaction,
  onApprove,
  onRevision,
  onReject
}: ReviewDeliverablesModalProps) {
  if (!isOpen) return null;

  const totalReleased = transaction.total - transaction.burnFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="glass rounded-3xl border-2 border-primary/30 max-w-5xl w-full max-h-[90vh] overflow-y-auto fade-in">
        {/* Header */}
        <div className="sticky top-0 glass backdrop-blur-xl border-b border-primary/20 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Review Deliverables</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Deliverables */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Deliverables</h3>
                
                {deliverables.map((deliverable) => (
                  <div key={deliverable.id} className="glass rounded-xl p-4 space-y-3">
                    <div className="text-sm text-gray-400">
                      {deliverable.id === 'design' ? 'DesignBot delivered. Here\'s the generated logo:' : 'CopyBot delivered! Suggested slogan:'}
                    </div>
                    
                    {deliverable.type === 'image' && (
                      <div className="rounded-lg overflow-hidden bg-dark-700">
                        <img
                          src={deliverable.content}
                          alt={deliverable.name}
                          className="w-full"
                        />
                      </div>
                    )}

                    {deliverable.type === 'text' && (
                      <div className="glass rounded-lg p-4 bg-dark-800/50">
                        <p className="text-lg font-medium">{deliverable.content}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {deliverable.type === 'image' && (
                        <>
                          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-primary/20 transition-colors text-sm font-medium">
                            <span></span> View Fullscreen
                          </button>
                          {/* <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-primary/20 transition-colors text-sm font-medium">
                            <Download size={16} />
                            Download
                          </button> */}
                        </>
                      )}
                      {/* {deliverable.type === 'text' && (
                        <>
                          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-primary/20 transition-colors text-sm font-medium">
                            <Copy size={16} />
                            Copy
                          </button>
                          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-primary/20 transition-colors text-sm font-medium">
                            Export (.txt)
                          </button>
                        </>
                      )} */}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Payment Summary */}
            <div className="space-y-4">
              {/* Escrow Status */}
              <div className="glass rounded-xl p-4 bg-primary/5 border border-primary/30">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="text-primary" size={18} />
                  <span className="font-semibold">Escrow Locked</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Payment secured in smart contract
                </div>
              </div>

              {/* Payment Summary */}
              <div className="glass rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-sm">Payment Summary</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Escrow Locked:</span>
                    <span className="font-bold">{transaction.total} HYPER</span>
                  </div>
                  
                  {transaction.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-accent-green" />
                      <span className="text-gray-400 flex-1">{item.agent}:</span>
                      <span className="font-medium">{item.amount} HYPER</span>
                    </div>
                  ))}
                  
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-accent-green" />
                    <span className="text-gray-400 flex-1">Burn Fee (5%):</span>
                    <span className="font-medium flex items-center gap-1">
                      {transaction.burnFee} HYPER
                      <span className="text-accent-orange"></span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 pt-2 border-t border-primary/20">
                    <CheckCircle2 size={14} className="text-accent-green" />
                    <span className="text-gray-400 flex-1">Total Released:</span>
                    <span className="font-bold text-accent-green">
                      {totalReleased.toFixed(1)} HYPER
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Preview */}
              <div className="glass rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-sm">Transaction Preview</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network:</span>
                    <span className="font-medium">Monad</span>
                  </div>
                  <div className="text-gray-400">Escrow Contract:</div>
                  <div className="font-mono text-secondary break-all">
                    {transaction.txHash || '0xA1...9D3'}
                  </div>
                  <div className="text-gray-400 pt-2">
                    Pending Release Tx: Awaiting Signature
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={onApprove}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg"
            >
              <CheckCircle2 size={20} />
              Approve & Release Payment
            </button>
            
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={onRevision}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                Request Revision
              </button>
              <button
                onClick={onReject}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold border-2 border-accent-red/50 text-accent-red hover:bg-accent-red/10 transition-all duration-300"
              >
                <XCircle size={18} />
                Reject & Refund
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
