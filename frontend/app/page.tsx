'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import WelcomeScreen from '@/components/WelcomeScreen';
import AgentStatus from '@/components/AgentStatus';
import ExecutionFeed from '@/components/ExecutionFeed';
import TaskExecution from '@/components/TaskExecution';
import ReviewDeliverablesModal from '@/components/ReviewDeliverablesModal';
import ProjectCompleteModal from '@/components/ProjectCompleteModal';
import { Agent, Task, Deliverable, Transaction, Project } from '@/types';

// JavaJoy logo as base64 data URL (placeholder - in production this would be generated)
const JAVAJOY_LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzJEMUIxMiIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE4MCIgcj0iODAiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuOSIvPjxlbGxpcHNlIGN4PSIyMDAiIGN5PSIyMDAiIHJ4PSI5MCIgcnk9IjQwIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjkiLz48cGF0aCBkPSJNMTYwIDE0MCBRMTYwIDEyMCAxNzUgMTEwIFQyMDAgMTAwIFEyMTUgMTAwIDIyNSAxMTAgVDI0MCAxNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIzIi8+PHBhdGggZD0iTTE3MCAxNjAgUTE3MCAxODAgMTg1IDE5NSBUMjE1IDE5NSBRMjI1IDE5NSAyMzUgMTg1IFQyNDAgMTYwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4QjVDRjYiIHN0cm9rZS13aWR0aD0iNCIvPjx0ZXh0IHg9IjIwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iU3BhY2UgR3JvdGVzaywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SmF2YUpveTwvdGV4dD48L3N2Zz4=';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [walletConnected] = useState(true);
  const [balance] = useState(0.00);
  const [lockedBalance, setLockedBalance] = useState(0);

  // Mock agents data
  const [agents] = useState<Agent[]>([
    { id: '1', name: 'DesignBot', icon: '🎨', cost: 50, status: 'idle', specialty: 'Logo & Graphics' },
    { id: '2', name: 'CopyBot', icon: '📝', cost: 20, status: 'idle', specialty: 'Copywriting' },
  ]);

  const [jobsCompleted] = useState(0);

  // Simulate project execution
  const startProject = (prompt: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      userPrompt: prompt,
      status: 'analyzing',
      tasks: [],
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

    // Simulate task progression
    setTimeout(() => {
      setCurrentProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'in-progress',
          tasks: [
            { id: '1', title: 'Escrow contract locked 70 HYPER.', description: '', assignedTo: 'ESCROW', status: 'completed' },
            { id: '2', title: 'Dispatching Task to DesignBot...', description: '', assignedTo: 'MANAGER', status: 'completed' },
            { id: '3', title: 'DesignBot accepted Task.', description: '', assignedTo: 'DesignBot', status: 'completed' },
          ]
        };
      });
    }, 1000);

    // Add design deliverable
    setTimeout(() => {
      setCurrentProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: [
            ...prev.tasks,
            { id: '4', title: 'DesignBot completed Task and delivered the logo.', description: '', assignedTo: 'DesignBot', status: 'completed' },
          ],
          deliverables: [
            { id: 'design', type: 'image', name: 'JavaJoy Logo.png', content: JAVAJOY_LOGO, downloadUrl: '#' }
          ]
        };
      });
    }, 2500);

    // Add copy task
    setTimeout(() => {
      setCurrentProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: [
            ...prev.tasks,
            { id: '5', title: 'CopyBot is generating copy...', description: '', assignedTo: 'CopyBot', status: 'in-progress', progress: 58 },
          ]
        };
      });
    }, 3500);

    // Complete copy
    setTimeout(() => {
      setCurrentProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'review',
          tasks: prev.tasks.map(t => 
            t.id === '5' ? { ...t, status: 'completed', progress: 100, title: 'CopyBot completed Task and delivered the slogan.' } : t
          ),
          deliverables: [
            ...prev.deliverables,
            { id: 'copy', type: 'text', name: 'Slogan', content: 'JavaJoy: Wake up to happiness.' }
          ]
        };
      });
    }, 5000);
  };

  const handleApproveFromExecution = () => {
    setShowReviewModal(true);
  };

  const handleApprove = () => {
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
    setTimeout(() => {
      setShowCompleteModal(true);
    }, 500);
  };

  const handleStartNew = () => {
    setShowCompleteModal(false);
    setCurrentProject(null);
  };

  const handleRevision = () => {
    setShowReviewModal(false);
    alert('Revision requested - agents will rework the deliverables');
  };

  const handleReject = () => {
    setShowReviewModal(false);
    setCurrentProject(null);
    setLockedBalance(0);
    alert('Payment refunded - project cancelled');
  };

  return (
    <div className="min-h-screen flex animated-bg cyber-grid-bg">
      
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Header
          connected={walletConnected}
          balance={balance}
          lockedBalance={lockedBalance}
          address="XXX...YYYY"
          txHash={currentProject?.transaction.txHash}
        />

        <main className="flex-1">
          {!currentProject ? (
            <WelcomeScreen onSubmit={startProject} />
          ) : (
            <div className="p-4 lg:p-6">
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2">
                    <TaskExecution
                      userPrompt={currentProject.userPrompt}
                      tasks={currentProject.tasks}
                      deliverables={currentProject.deliverables}
                      onApprove={handleApproveFromExecution}
                      />
                  </div>

                  {/* Sidebar Panels */}
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
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Modals */}
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
