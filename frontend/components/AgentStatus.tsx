'use client';

import React from 'react';
import { Agent } from '@/types';
import { Coffee, FileText, Palette } from 'lucide-react';

interface AgentStatusProps {
  agents: Agent[];
  escrowLocked: number;
  jobsCompleted: number;
}

const agentIcons: Record<string, any> = {
  DesignBot: Palette,
  CopyBot: FileText,
  default: Coffee,
};

export default function AgentStatus({ agents, escrowLocked, jobsCompleted }: AgentStatusProps) {
  return (
    <div className="glass rounded-2xl p-4 lg:p-6 space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <span className="text-2xl">⚡</span>
        Agent Status
      </h3>

      {/* Available Agents */}
      <div className="space-y-3">
        <p className="text-sm text-gray-400 font-medium">Available Agents</p>
        {agents.map((agent) => {
          const Icon = agentIcons[agent.name] || agentIcons.default;
          return (
            <div
              key={agent.id}
              className="glass rounded-xl p-4 hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{agent.name}</div>
                    <div className="text-xs text-gray-400">{agent.cost} HYPER</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === 'idle' ? 'bg-accent-green' :
                    agent.status === 'busy' ? 'bg-accent-orange animate-pulse' :
                    'bg-gray-500'
                  }`} />
                  <span className="text-xs text-gray-400 capitalize">{agent.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="space-y-3 pt-4 border-t border-primary/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Escrow Locked:</span>
          <span className="font-bold flex items-center gap-1">
            <span className="text-accent-orange">🔒</span>
            {escrowLocked}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Jobs Completed:</span>
          <span className="font-bold">{jobsCompleted}</span>
        </div>
      </div>

      {/* HYPER Token Info */}
      <div className="glass rounded-xl p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl">
            ⚡
          </div>
          <div className="flex-1">
            <div className="font-bold">HYPER</div>
            <div className="text-xs text-gray-400">Platform Token</div>
          </div>
        </div>
      </div>
    </div>
  );
}
