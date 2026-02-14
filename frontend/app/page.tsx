'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import WelcomeScreen from '@/components/WelcomeScreen';
import ConnectWalletPrompt from '@/components/ConnectWalletPrompt';
import AgentStatus from '@/components/AgentStatus';
import ExecutionFeed from '@/components/ExecutionFeed';
import TaskExecution from '@/components/TaskExecution';
import ReviewDeliverablesModal from '@/components/ReviewDeliverablesModal';
import ProjectCompleteModal from '@/components/ProjectCompleteModal';
import { Agent, Task, Deliverable, Transaction, Project } from '@/types';
import { hypertaskAPI, type ExecutionResult } from '@/services/api';
import { logger } from '@/utils/logger';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false); // Start as false
  const [balance, setBalance] = useState(500.00); // Give 500 on claim
  const [lockedBalance, setLockedBalance] = useState(0);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);

  const [jobsCompleted] = useState(0);

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
        logger.warn('HomePage', 'API not available, using demo mode');
      }
    } catch (err) {
      setApiConnected(false);
      logger.error('HomePage', 'API health check failed', err);
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
        logger.warn('HomePage', 'No agents from API, using defaults');
        // Use default agents as fallback
        setAgents([
          { id: '1', name: 'DesignBot', icon: '🎨', cost: 50, status: 'idle', specialty: 'Logo & Graphics' },
          { id: '2', name: 'CopyBot', icon: '📝', cost: 20, status: 'idle', specialty: 'Copywriting' },
        ]);
      }
    } catch (err) {
      logger.error('HomePage', 'Failed to fetch agents', err);
      // Use default agents
      setAgents([
        { id: '1', name: 'DesignBot', icon: '🎨', cost: 50, status: 'idle', specialty: 'Logo & Graphics' },
        { id: '2', name: 'CopyBot', icon: '📝', cost: 20, status: 'idle', specialty: 'Copywriting' },
      ]);
    }
  };

  const startProject = async (prompt: string) => {
    logger.info('HomePage', 'Starting new project', { prompt });
    setLoading(true);
    setError(null);

    // Create initial project
    const newProject: Project = {
      id: Date.now().toString(),
      userPrompt: prompt,
      status: 'analyzing',
      tasks: [
        { id: '1', title: 'Analyzing request...', description: '', assignedTo: 'MANAGER', status: 'in-progress' }
      ],
      deliverables: [],
      transaction: {
        id: 'tx-' + Date.now(),
        total: 70,
        breakdown: [
          { agent: 'DesignBot', amount: 50 },
          { agent: 'CopyBot', amount: 20 },
        ],
        burnFee: 3.5,
        status: 'pending',
        txHash: '0x93...ab2'
      }
    };

    setCurrentProject(newProject);
    setLockedBalance(70);

    try {
      logger.info('HomePage', 'Calling API execute endpoint', { projectId: newProject.id });
      
      // Call API using the service
      const result = await hypertaskAPI.executeProject({
        prompt: prompt,
        context: {
          brand_voice: 'professional and friendly',
          design_style: 'modern minimalist',
          colors: ['purple', 'cyan']
        }
      });
      
      logger.success('HomePage', 'API execution successful', { deliverables: result.deliverables.length });
      
      // Update with real results
      updateProjectWithResults(result, newProject);
      
    } catch (err) {
      logger.error('HomePage', 'API execution failed', err);
      setError('API connection failed - using demo mode');
      // Fall back to demo
      simulateDemoProject(newProject);
    }
  };

  const updateProjectWithResults = (result: ExecutionResult, project: Project) => {
    // Simulate progress with real data
    setTimeout(() => {
      setCurrentProject(prev => prev ? {
        ...prev,
        tasks: [
          { id: '1', title: 'Escrow locked 70 HYPER', description: '', assignedTo: 'ESCROW', status: 'completed' },
          { id: '2', title: 'Manager analyzed request', description: '', assignedTo: 'MANAGER', status: 'completed' },
          { id: '3', title: 'Dispatching to agents...', description: '', assignedTo: 'MANAGER', status: 'in-progress', progress: 30 },
        ]
      } : prev);
    }, 1000);

    // Progress update
    setTimeout(() => {
      setCurrentProject(prev => prev ? {
        ...prev,
        tasks: [
          { id: '1', title: 'Escrow locked 70 HYPER', description: '', assignedTo: 'ESCROW', status: 'completed' },
          { id: '2', title: 'Manager analyzed request', description: '', assignedTo: 'MANAGER', status: 'completed' },
          { id: '3', title: 'DesignBot creating logo...', description: '', assignedTo: 'DesignBot', status: 'in-progress', progress: 60 },
        ]
      } : prev);
    }, 2000);

    // Final results update
    setTimeout(() => {
      const deliverables: Deliverable[] = result.deliverables.map((d: any) => ({
        id: d.id,
        type: d.type,
        name: d.name,
        content: d.content,
        downloadUrl: d.type === 'image' ? '#' : undefined
      }));

      const tasks: Task[] = [];
      
      // Build tasks based on deliverables
      result.deliverables.forEach((d: any) => {
        if (d.type === 'image') {
          tasks.push({
            id: d.id,
            title: 'DesignBot completed logo',
            description: '',
            assignedTo: 'DesignBot',
            status: 'completed'
          });
        } else if (d.type === 'text') {
          tasks.push({
            id: d.id,
            title: 'CopyBot generated slogan',
            description: '',
            assignedTo: 'CopyBot',
            status: 'completed'
          });
        }
      });

      setCurrentProject(prev => prev ? {
        ...prev,
        status: 'review',
        tasks: [
          { id: '1', title: 'Escrow locked 70 HYPER', description: '', assignedTo: 'ESCROW', status: 'completed' },
          { id: '2', title: 'Manager analyzed request', description: '', assignedTo: 'MANAGER', status: 'completed' },
          ...tasks,
        ],
        deliverables,
        transaction: {
          ...prev.transaction,
          total: result.transaction.total,
          breakdown: result.transaction.breakdown,
          burnFee: result.transaction.burn_fee
        }
      } : prev);
      
      setLoading(false);
    }, 3500);
  };

  const simulateDemoProject = (project: Project) => {
    setTimeout(() => {
      setCurrentProject(prev => prev ? {
        ...prev,
        tasks: [
          { id: '1', title: 'Escrow locked 70 HYPER', description: '', assignedTo: 'ESCROW', status: 'completed' },
          { id: '2', title: 'Manager Agent analyzing...', description: '', assignedTo: 'MANAGER', status: 'completed' },
        ]
      } : prev);
    }, 1000);

    setTimeout(() => {
      setCurrentProject(prev => prev ? {
        ...prev,
        tasks: [
          ...prev.tasks,
          { id: '3', title: 'DesignBot accepted task', description: '', assignedTo: 'DesignBot', status: 'completed' },
        ],
        deliverables: [
          {
            id: 'design',
            type: 'image',
            name: 'Logo.png',
            content: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzhCNUNGNiIvPjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2dvPC90ZXh0Pjwvc3ZnPg==',
            downloadUrl: '#'
          }
        ]
      } : prev);
    }, 2500);

    setTimeout(() => {
      setCurrentProject(prev => prev ? {
        ...prev,
        status: 'review',
        tasks: [
          ...prev.tasks,
          { id: '4', title: 'CopyBot generated slogan', description: '', assignedTo: 'CopyBot', status: 'completed' },
        ],
        deliverables: [
          ...prev.deliverables,
          {
            id: 'copy',
            type: 'text',
            name: 'Slogan',
            content: 'Excellence in Every Detail'
          }
        ]
      } : prev);
      setLoading(false);
    }, 4000);
  };

  const handleApproveFromExecution = () => {
    setShowReviewModal(true);
  };

  const handleApprove = () => {
    if (!currentProject) return;
    
    logger.info('HomePage', 'Project approved', { projectId: currentProject.id });
    
    setShowReviewModal(false);
    setCurrentProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: 'completed',
        transaction: { ...prev.transaction, status: 'completed' }
      };
    });
    setLockedBalance(0);
    
    // Save to history
    try {
      const existing = localStorage.getItem('hypertask_history');
      const history = existing ? JSON.parse(existing) : [];
      
      history.push({
        id: currentProject.id,
        prompt: currentProject.userPrompt,
        status: 'completed',
        timestamp: new Date().toLocaleString(),
        cost: currentProject.transaction.total,
        deliverables: currentProject.deliverables.map(d => ({ type: d.type, name: d.name }))
      });
      
      localStorage.setItem('hypertask_history', JSON.stringify(history));
      logger.success('HomePage', 'Project saved to history');
    } catch (error) {
      logger.error('HomePage', 'Failed to save to history', error);
    }
    
    setTimeout(() => {
      setShowCompleteModal(true);
    }, 500);
  };

  const handleStartNew = () => {
    setShowCompleteModal(false);
    setCurrentProject(null);
    setError(null);
  };

  const handleRevision = () => {
    logger.info('HomePage', 'Revision requested', { projectId: currentProject?.id });
    setShowReviewModal(false);
    alert('Revision requested - agents will rework deliverables');
  };

  const handleReject = () => {
    logger.info('HomePage', 'Project rejected', { projectId: currentProject?.id });
    setShowReviewModal(false);
    setCurrentProject(null);
    setLockedBalance(0);
    alert('Payment refunded - project cancelled');
  };

  const handleConnect = () => {
    logger.info('HomePage', 'Wallet connected');
    setWalletConnected(true);
    setBalance(500.00); // Give initial test tokens
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

  return (
    <div className="min-h-screen flex animated-bg cyber-grid-bg">
      {walletConnected && <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />}
      
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Header
          connected={walletConnected}
          balance={balance}
          lockedBalance={lockedBalance}
          address={walletConnected ? "XXX...YYYY" : undefined}
          txHash={currentProject?.transaction.txHash}
          onClaimHyper={handleClaimHyper}
        />

        <main className="flex-1">
          {!walletConnected ? (
            <ConnectWalletPrompt onConnect={handleConnect} />
          ) : !currentProject ? (
            <div>
              <WelcomeScreen onSubmit={startProject} />
              
              {error && (
                <div className="fixed bottom-4 right-4 bg-accent-orange/20 border border-accent-orange/50 rounded-xl p-4 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="text-accent-orange">⚠️</span>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 lg:p-6">
              <div className="max-w-7xl mx-auto">
                {loading && (
                  <div className="mb-4 glass rounded-xl p-4 text-center">
                    <div className="spinner w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">AI agents working...</p>
                  </div>
                )}
                
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <TaskExecution
                      userPrompt={currentProject.userPrompt}
                      tasks={currentProject.tasks}
                      deliverables={currentProject.deliverables}
                      onApprove={handleApproveFromExecution}
                    />
                  </div>

                  <div className="space-y-6">
                    <ExecutionFeed
                      tasks={currentProject.tasks}
                      escrowAmount={lockedBalance}
                    />
                    <AgentStatus
                      agents={agents}
                      escrowLocked={lockedBalance}
                      jobsCompleted={jobsCompleted}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {currentProject && (
        <>
          <ReviewDeliverablesModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            deliverables={currentProject.deliverables}
            transaction={currentProject.transaction}
            onApprove={handleApprove}
            onRevision={handleRevision}
            onReject={handleReject}
          />

          <ProjectCompleteModal
            isOpen={showCompleteModal}
            onClose={() => setShowCompleteModal(false)}
            deliverables={currentProject.deliverables}
            transaction={currentProject.transaction}
            onStartNew={handleStartNew}
          />
        </>
      )}
    </div>
  );
}