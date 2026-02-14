'use client';

import React from 'react';
import { MessageCircle, CheckCircle2, Loader, Zap, Lock } from 'lucide-react';
import { Task, Deliverable } from '@/types';

import './styles/exec.css'; 

interface TaskExecutionProps {
  userPrompt: string;
  tasks: Task[];
  deliverables: Deliverable[];
  onApprove: () => void;
}

export default function TaskExecution({ userPrompt, tasks, deliverables, onApprove }: TaskExecutionProps) {
  const hasCompletedTasks = tasks.some(t => t.status === 'completed');
  const allTasksComplete = tasks.every(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      {/* User Prompt */}
      <div className="glass rounded-2xl p-6 border-l-4 border-primary">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <MessageCircle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-400 mb-1">User:</div>
            <div className="text-lg font-medium">{userPrompt}</div>
          </div>
        </div>
      </div>

      {/* Manager Agent Analysis */}
      {tasks.length > 0 && (
        <div className="glass rounded-2xl p-6 glow-pulse">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0 animate-pulse">
              <span className="text-xl">◆</span>
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              <div className="font-semibold">Manager Agent Analysis:</div>
              
              {/* Progress Steps */}
              <div className="space-y-2 text-sm text-gray-300">
                {/* Step 1: Analyzing */}
                <div className="flex items-center gap-3 slide-in-left">
                  <CheckCircle2 size={16} className="text-accent-green flex-shrink-0" />
                  <span>Request analyzed</span>
                </div>
                
                {/* Step 2: Hiring */}
                <div className="flex items-center gap-3 slide-in-left" style={{ animationDelay: '0.1s' }}>
                  {tasks.some(t => t.assignedTo && (t.assignedTo === 'DesignBot' || t.assignedTo === 'CopyBot')) ? 
                    <CheckCircle2 size={16} className="text-accent-green flex-shrink-0" /> :
                    <Loader size={16} className="text-primary flex-shrink-0 animate-spin" />
                  }
                  <span>Hiring DesignBot (50 HYPER) & CopyBot (20 HYPER)</span>
                </div>
                
                {/* Step 3: Escrow */}
                <div className="flex items-center gap-3 slide-in-left" style={{ animationDelay: '0.2s' }}>
                  {tasks.some(t => t.assignedTo === 'ESCROW' && t.status === 'completed') ? 
                    <CheckCircle2 size={16} className="text-accent-green flex-shrink-0" /> :
                    tasks.some(t => t.assignedTo === 'ESCROW') ?
                    <Loader size={16} className="text-primary flex-shrink-0 animate-spin" /> :
                    <Loader size={16} className="w-4 h-4 rounded-full border-2 border-gray-600" /> 
                  }
                  <span>Escrow locked on-chain (70 HYPER)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escrow Locked */}
      {tasks.some(t => t.assignedTo === 'ESCROW') && (
        <div className="glass rounded-xl p-4 bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Lock size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-semibold flex items-center gap-2">
                <span>Escrow Payment</span>
                {tasks.find(t => t.assignedTo === 'ESCROW')?.status === 'completed' && 
                  <CheckCircle2 size={16} className="text-accent-green" />
                }
              </div>
              <div className="text-xs text-gray-400 mt-1">
                70 HYPER secured on-chain. Dispatching agents...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deliverables Preview */}
      {deliverables.map((deliverable, idx) => {
        const task = tasks.find(t => {
          if (deliverable.id.includes('design') || deliverable.type === 'image') return t.assignedTo === 'DesignBot';
          if (deliverable.id.includes('copy') || deliverable.type === 'text') return t.assignedTo === 'CopyBot';
          return false;
        });
        
        return (
          <div key={deliverable.id} className="glass rounded-2xl p-6 space-y-4 border-l-4 border-accent-green fade-in slide-in-left" style={{ animationDelay: `${0.3 + idx * 0.2}s` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle2 size={20} className="text-accent-green flex-shrink-0 mt-1 animate-pulse" />
                <div>
                  <div className="font-semibold text-sm">
                    {deliverable.id === 'design' ? 'DesignBot' : 'CopyBot'} 
                    <span className="text-gray-400 font-normal"> completed ✓</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {deliverable.id === 'design' ? 'Logo & graphics generated' : 'Copy & slogan created'}
                  </div>
                </div>
              </div>
            </div>
            
            {deliverable.type === 'image' && (
              <div className="rounded-xl overflow-hidden bg-dark-700 max-w-md">
                <img
                  src={deliverable.content}
                  alt={deliverable.name}
                  className="w-full"
                />
              </div>
            )}

            {deliverable.type === 'text' && deliverable.content && (
              <div className="glass rounded-lg p-4 bg-dark-800/50 border border-primary/20">
                <p className="text-base font-medium text-white">{deliverable.content}</p>
              </div>
            )}

            {deliverable.type === 'text' && !deliverable.content && (
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Loader size={16} className="animate-spin text-primary" />
                <span>Generating copy... 58%</span>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button className="flex-1 px-4 py-2 rounded-lg bg-dark-800 hover:bg-primary/20 transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-gray-600 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
                <span>📋</span> Copy
              </button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-dark-800 hover:bg-primary/20 transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-gray-600 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
                <span>⬇️</span> Download
              </button>
            </div>
          </div>
        );
      })}

      {/* Approve Button */}
      {allTasksComplete && deliverables.length > 0 && (
        <button
          onClick={onApprove}
          className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg"
        >
          <CheckCircle2 size={20} />
          Approve & Release Payment
        </button>
      )}
    </div>
  );
}
