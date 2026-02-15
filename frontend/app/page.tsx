'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ConnectWalletPrompt from '@/components/ConnectWalletPrompt';
import ChatInterface from '@/components/ChatInterface';
import DeliverableViewer from '@/components/DeliverableViewer';
import AgentStatus from '@/components/AgentStatus';
import { Agent, Deliverable } from '@/types';
import { hypertaskAPI } from '@/services/api';
import { logger } from '@/utils/logger';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [balance, setBalance] = useState(500.00);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]); // Use any[] to bypass type checking
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>('');

  // Check API connection on mount
  useEffect(() => {
    logger.info('HomePage', 'Initializing dashboard');
    checkApiConnection();
    fetchAgents();
  }, []);

  const checkApiConnection = async () => {
    logger.info('HomePage', 'Checking API connection');
    try {
      const isHealthy = await hypertaskAPI.checkHealth();
      setApiConnected(isHealthy);
      if (isHealthy) {
        logger.success('HomePage', 'Connected to HyperTask API');
      } else {
        logger.warn('HomePage', 'API not available');
        setError('Backend API is not available. Please start the backend server.');
      }
    } catch (err) {
      setApiConnected(false);
      logger.error('HomePage', 'API health check failed', err);
      setError('Cannot connect to backend. Make sure the API is running on http://localhost:8000');
    }
  };

  const fetchAgents = async () => {
    logger.info('HomePage', 'Fetching agents list');
    try {
      const agentsList = await hypertaskAPI.getAgents();
      if (agentsList && agentsList.length > 0) {
        logger.success('HomePage', 'Agents loaded', { count: agentsList.length });
        setAgents(agentsList.map((agent: any) => ({
          id: agent.name.toLowerCase(),
          name: agent.name,
          icon: agent.name === 'DesignBot' ? '🎨' : '📝',
          cost: agent.cost,
          status: 'idle' as const,
          specialty: agent.specialty
        })));
      } else {
        // Fallback agents
        setAgents([
          { id: 'designbot', name: 'DesignBot', icon: '🎨', cost: 50, status: 'idle', specialty: 'Logo & Graphics' },
          { id: 'copybot', name: 'CopyBot', icon: '📝', cost: 20, status: 'idle', specialty: 'Professional Copywriting' },
        ]);
      }
    } catch (err) {
      logger.error('HomePage', 'Failed to fetch agents', err);
      // Use default agents
      setAgents([
        { id: 'designbot', name: 'DesignBot', icon: '🎨', cost: 50, status: 'idle', specialty: 'Logo & Graphics' },
        { id: 'copybot', name: 'CopyBot', icon: '📝', cost: 20, status: 'idle', specialty: 'Professional Copywriting' },
      ]);
    }
  };

  const handleTaskReady = async (convId: string) => {
    if (!apiConnected) {
      setError('Cannot execute: Backend API is not connected');
      return;
    }

    setExecuting(true);
    setLoading(true);
    setError(null);
    setConversationId(convId);
    
    logger.info('HomePage', 'Executing tasks', { conversationId: convId });

    try {
      // Call the execute endpoint
      const response = await fetch('http://localhost:8000/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: convId })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      logger.success('HomePage', 'Execution completed', { 
        deliverables: data.deliverables?.length || 0,
        status: data.status 
      });

      // Map deliverables - include all properties including agent
      const mappedDeliverables = data.deliverables.map((d: any) => ({
        id: d.id,
        type: d.type === 'markdown' ? 'text' : d.type,
        name: d.name,
        content: d.content,
        downloadUrl: d.type === 'image' ? '#' : undefined,
        metadata: d.metadata,
        agent: d.agent || 'AI Agent' // Always include agent
      }));

      setDeliverables(mappedDeliverables);

      // Extract brand name from deliverables if available
      if (data.deliverables.length > 0) {
        const firstDeliverable = data.deliverables[0];
        const extractedBrand = firstDeliverable.name?.split('_')[0] || 
                              firstDeliverable.metadata?.brand_name || 
                              'Your Brand';
        setBrandName(extractedBrand);
      }

      // Calculate and lock balance
      const totalCost = data.transaction?.total || 70;
      setLockedBalance(totalCost);

      // Simulate balance deduction
      setTimeout(() => {
        setBalance(prev => Math.max(0, prev - totalCost));
        setLockedBalance(0);
      }, 2000);

    } catch (err: any) {
      logger.error('HomePage', 'Execution failed', err);
      setError(err.message || 'Failed to execute tasks. Please check the backend logs.');
    } finally {
      setLoading(false);
      setExecuting(false);
    }
  };

  const handleConnect = () => {
    logger.info('HomePage', 'Wallet connected');
    setWalletConnected(true);
    setBalance(500.00);
  };

  const handleClaimHyper = () => {
    logger.info('HomePage', 'Claiming test HYPER');
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setBalance(prev => prev + 500);
        logger.success('HomePage', 'Claimed 500 test HYPER');
        resolve();
      }, 1000);
    });
  };

  const handleClearResults = () => {
    setDeliverables([]);
    setConversationId(null);
    setError(null);
    setBrandName('');
  };

  return (
    <div className="min-h-screen flex animated-bg cyber-grid-bg">
      {walletConnected && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
      )}
      
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Header
          connected={walletConnected}
          balance={balance}
          lockedBalance={lockedBalance}
          address={walletConnected ? "0x1234...5678" : undefined}
          txHash={conversationId ? `0x${conversationId.substring(0, 8)}...` : undefined}
          onClaimHyper={handleClaimHyper}
        />

        <main className="flex-1 p-4 lg:p-6">
          {!walletConnected ? (
            <ConnectWalletPrompt onConnect={handleConnect} />
          ) : (
            <div className="max-w-7xl mx-auto">
              {/* API Status Banner */}
              {!apiConnected && (
                <div className="mb-4 glass rounded-xl p-4 border border-accent-orange/50 bg-accent-orange/10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-accent-orange mb-1">Backend Not Connected</h3>
                      <p className="text-sm text-gray-400">
                        Start the backend: <code className="bg-dark-700 px-2 py-1 rounded text-xs">python3 api/main.py</code>
                      </p>
                    </div>
                    <button
                      onClick={checkApiConnection}
                      className="px-4 py-2 rounded-lg glass border border-primary/30 hover:border-primary/50 transition-all text-sm"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-4 glass rounded-xl p-4 border border-red-500/50 bg-red-500/10">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">❌</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-400 mb-1">Error</h3>
                      <p className="text-sm text-gray-300">{error}</p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Chat Section */}
                <div className="glass rounded-xl border border-primary/20 h-[600px] lg:h-[700px] flex flex-col">
                  <div className="p-4 border-b border-primary/20">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      💬 HyperTask AI Assistant
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Tell me what you need, and I'll coordinate the AI agents
                    </p>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <ChatInterface 
                      onTaskReady={handleTaskReady}
                      apiUrl="http://localhost:8000"
                    />
                  </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                  {/* Deliverables */}
                  <div className="glass rounded-xl border border-primary/20 p-4 min-h-[400px] max-h-[500px] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        📦 Deliverables
                      </h2>
                      {deliverables.length > 0 && (
                        <button
                          onClick={handleClearResults}
                          className="text-xs px-3 py-1.5 rounded-lg glass border border-primary/20 hover:border-primary/50 transition-all"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {loading || executing ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl">🤖</span>
                          </div>
                        </div>
                        <p className="mt-4 text-gray-400 text-sm">Creating your deliverables...</p>
                        <p className="mt-2 text-gray-500 text-xs">AI agents are working</p>
                      </div>
                    ) : deliverables.length > 0 ? (
                      <DeliverableViewer deliverables={deliverables as any} brandName={brandName} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="text-6xl mb-4 opacity-50">📦</div>
                        <p className="text-gray-400 text-sm">Your deliverables will appear here</p>
                        <p className="text-gray-500 text-xs mt-2">Start a conversation to create something amazing!</p>
                      </div>
                    )}
                  </div>

                  {/* Agent Status */}
                  <AgentStatus
                    agents={agents}
                    escrowLocked={lockedBalance}
                    jobsCompleted={0}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}