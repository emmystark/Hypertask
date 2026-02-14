'use client';

import React from 'react';
import { MessageCircle, CheckCircle2 } from 'lucide-react';
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
        <div className="glass rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">◆</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold mb-2">Manager Agent:</div>
              <div className="text-sm text-gray-300">
                Analyzing request... Strategy formed. Hiring DesignBot (50 HYPER) and CopyBot (20 HYPER). Initiating tasks...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escrow Locked */}
      {tasks.some(t => t.assignedTo === 'ESCROW') && (
        <div className="glass rounded-xl p-4 bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-l">■</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold flex items-center gap-2">
                <span className="text-accent-orange">🔒</span>
                ESCROW: 70 HYPER locked.
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Payment secured. Dispatching DesignBot...
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-accent-green text-white text-sm font-medium">
              Complete
            </button>
          </div>
        </div>
      )}

      {/* Deliverables Preview */}
      {deliverables.map((deliverable) => (
        <div key={deliverable.id} className="glass rounded-2xl p-6 space-y-4">
          <div className="text-sm text-gray-400">
            {deliverable.id === 'design' ? 'DesignBot delivered! Here\'s the generated logo:' : 'CopyBot is working on copywriting...'}
          </div>
          
          {deliverable.type === 'image' && (
            <div className="rounded-xl overflow-hidden bg-dark-700 max-w-md">
              <img
                src={deliverable.content}
                alt={deliverable.name}
                className="w-full"
              />
              <div className="p-3 flex gap-2">
                <button className="flex-1 px-4 py-2 rounded-lg bg-dark-800 hover:bg-primary/20 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <span>💾</span> Save
                </button>
                <button className="flex-1 px-4 py-2 rounded-lg bg-dark-800 hover:bg-primary/20 transition-colors text-sm font-medium">
                  Download
                </button>
              </div>
            </div>
          )}

          {deliverable.id === 'copy' && deliverable.type === 'text' && (
            <div className="text-gray-300">
              {deliverable.content ? (
                <div className="glass rounded-lg p-4 bg-dark-800/50">
                  <p className="text-lg font-medium">{deliverable.content}</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm">
                  <div className="spinner w-4 h-4" />
                  <span>Generating copy... 58%</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

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
