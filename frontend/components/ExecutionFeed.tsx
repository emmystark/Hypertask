'use client';

import React from 'react';
import { Task } from '@/types';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

interface ExecutionFeedProps {
  tasks: Task[];
  escrowAmount?: number;
}

export default function ExecutionFeed({ tasks, escrowAmount }: ExecutionFeedProps) {
  const getTaskIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="text-accent-green" size={16} />;
      case 'in-progress':
        return <Circle className="text-accent-orange animate-pulse" size={16} />;
      default:
        return <Circle className="text-gray-500" size={16} />;
    }
  };

  const getTaskPrefix = (task: Task) => {
    if (task.status === 'completed') return '[WORKER]';
    if (task.status === 'in-progress') return '[WORKER]';
    if (task.assignedTo === 'MANAGER') return '[MANAGER]';
    if (task.assignedTo === 'ESCROW') return '[ESCROW]';
    return '[SYSTEM]';
  };

  return (
    <div className="glass rounded-2xl p-4 lg:p-6 space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <span className="text-2xl">►</span>
        Execution Feed
      </h3>

      {/* Task List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Circle size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks yet</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
              className="glass rounded-xl p-4 space-y-2 fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                {getTaskIcon(task.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-primary">
                      {getTaskPrefix(task)}
                    </span>
                    <span className="text-sm text-gray-300">{task.title}</span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                  )}
                  {task.progress !== undefined && task.status === 'in-progress' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-mono text-primary">{task.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Escrow Status */}
      {escrowAmount !== undefined && escrowAmount > 0 && (
        <div className="glass rounded-xl p-4 bg-accent-orange/10 border border-accent-orange/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="text-accent-orange" size={18} />
              <span className="font-semibold text-sm">Escrow Locked</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{escrowAmount} HYPER</div>
              <div className="text-xs text-gray-400">Payment secured</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
