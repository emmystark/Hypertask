'use client';

import React, { useState } from 'react';
import { X, Lock, CheckCircle2, XCircle, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface PaymentReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliverables: any[];
  transaction: {
    total: number;
    breakdown: Array<{ agent: string; amount: number }>;
    burnFee: number;
    txHash: string;
  };
  onRelease: () => void;
  onReject: () => void;
  paymentReleased: boolean;
}

export default function PaymentReleaseModal({
  isOpen,
  onClose,
  deliverables,
  transaction,
  onRelease,
  onReject,
  paymentReleased
}: PaymentReleaseModalProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [releasing, setReleasing] = useState(false);

  if (!isOpen) return null;

  const handleRelease = () => {
    setReleasing(true);
    setTimeout(() => {
      onRelease();
      setReleasing(false);
    }, 2000);
  };

  const totalReleased = transaction.total - transaction.burnFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fadeIn">
      <div className="glass rounded-3xl border-2 border-primary/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto fade-in">
        {/* Header */}
        <div className="sticky top-0 glass backdrop-blur-xl border-b border-primary/20 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {paymentReleased ? (
              <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center">
                <CheckCircle2 className="text-accent-green" size={24} />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-accent-orange/20 flex items-center justify-center">
                <Lock className="text-accent-orange" size={24} />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">
                {paymentReleased ? 'Payment Released!' : 'Review Deliverables'}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {paymentReleased 
                  ? 'Your deliverables are now unlocked' 
                  : `${deliverables.length} deliverable${deliverables.length !== 1 ? 's' : ''} ready for review`
                }
              </p>
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
          {/* Payment Required Banner */}
          {!paymentReleased && (
            <div className="glass rounded-xl p-4 bg-accent-orange/10 border border-accent-orange/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-accent-orange mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <div className="font-semibold text-accent-orange mb-1">Payment Required to Access</div>
                  <div className="text-sm text-gray-300">
                    Release the escrowed payment ({transaction.total} HYPER) to unlock and download your deliverables. 
                    If you're not satisfied, you can reject and get a full refund.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {paymentReleased && (
            <div className="glass rounded-xl p-4 bg-accent-green/10 border border-accent-green/30">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-accent-green flex-shrink-0" size={20} />
                <div>
                  <div className="font-semibold text-accent-green">Payment Successfully Released</div>
                  <div className="text-sm text-gray-300 mt-1">
                    {totalReleased.toFixed(1)} HYPER distributed to agents. You can now download your deliverables.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deliverables Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Deliverables Preview</h3>
              {!paymentReleased && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  {showPreview ? (
                    <>
                      <EyeOff size={16} />
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <Eye size={16} />
                      Show Preview
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {deliverables.map((deliverable) => (
                <div key={deliverable.id} className="glass rounded-xl p-4 space-y-3 relative">
                  {/* Lock Overlay */}
                  {!paymentReleased && (
                    <div className="absolute inset-0 bg-dark-900/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                      <div className="text-center">
                        <Lock className="text-gray-400 mx-auto mb-2" size={32} />
                        <div className="text-sm text-gray-400 font-medium">Release payment to unlock</div>
                      </div>
                    </div>
                  )}

                  {/* Preview (blurred if not paid) */}
                  {deliverable.type === 'image' && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-dark-700">
                      <img
                        src={deliverable.content}
                        alt={deliverable.name}
                        className={`w-full h-full object-cover ${
                          !paymentReleased && !showPreview ? 'blur-xl' : paymentReleased ? '' : 'blur-sm'
                        }`}
                      />
                    </div>
                  )}

                  {deliverable.type === 'text' && (
                    <div className={`glass rounded-lg p-3 text-sm bg-dark-800/50 max-h-32 overflow-hidden ${
                      !paymentReleased && !showPreview ? 'blur-xl' : paymentReleased ? '' : 'blur-sm'
                    }`}>
                      <div className="text-gray-300 line-clamp-4">
                        {deliverable.content}
                      </div>
                    </div>
                  )}

                  {/* Deliverable Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm">{deliverable.name}</div>
                      {paymentReleased && (
                        <CheckCircle2 size={14} className="text-accent-green flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      Created by {deliverable.agent}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Payment Summary</h3>
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="text-primary" size={18} />
                <span className="font-semibold">Escrowed in Smart Contract</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Locked:</span>
                  <span className="font-bold">{transaction.total} HYPER</span>
                </div>
                
                <div className="border-t border-primary/20 pt-2 space-y-2">
                  {transaction.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <CheckCircle2 size={14} className={paymentReleased ? 'text-accent-green' : 'text-gray-400'} />
                      <span className="text-gray-400 flex-1">{item.agent}:</span>
                      <span className="font-medium">{item.amount} HYPER</span>
                    </div>
                  ))}
                  
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={14} className={paymentReleased ? 'text-accent-green' : 'text-gray-400'} />
                    <span className="text-gray-400 flex-1">Burn Fee (5%):</span>
                    <span className="font-medium flex items-center gap-1">
                      {transaction.burnFee.toFixed(1)} HYPER
                      <span className="text-accent-orange">🔥</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 pt-2 border-t border-primary/20">
                  <CheckCircle2 size={14} className={paymentReleased ? 'text-accent-green' : 'text-gray-400'} />
                  <span className="text-gray-400 flex-1">Released to Agents:</span>
                  <span className={`font-bold ${paymentReleased ? 'text-accent-green' : 'text-gray-300'}`}>
                    {totalReleased.toFixed(1)} HYPER
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Hash */}
            <div className="glass rounded-xl p-4">
              <div className="text-sm font-medium mb-2">Transaction Details</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Network:</span>
                  <span className="font-medium">Monad Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Escrow Contract:</span>
                  <span className="font-mono text-secondary">{transaction.txHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-semibold ${paymentReleased ? 'text-accent-green' : 'text-accent-orange'}`}>
                    {paymentReleased ? '✓ Released' : '⏳ Pending Release'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!paymentReleased ? (
            <div className="space-y-3">
              <button
                onClick={handleRelease}
                disabled={releasing}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {releasing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Releasing Payment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    <span>Release Payment & Access Deliverables</span>
                  </>
                )}
              </button>
              
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={onClose}
                  disabled={releasing}
                  className="btn-secondary disabled:opacity-50"
                >
                  Review More
                </button>
                <button
                  onClick={onReject}
                  disabled={releasing}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold border-2 border-accent-red/50 text-accent-red hover:bg-accent-red/10 transition-all duration-300 disabled:opacity-50"
                >
                  <XCircle size={18} />
                  Reject & Refund
                </button>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">
                💡 Tip: Click "Show Preview" above to see a blurred preview before releasing payment
              </p>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full btn-primary py-4"
            >
              Access Your Deliverables
            </button>
          )}
        </div>
      </div>
    </div>
  );
}