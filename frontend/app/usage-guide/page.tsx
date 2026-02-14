'use client';

import React, { useState } from 'react';
import { BookOpen, ChevronDown, Check } from 'lucide-react';
import { logger } from '@/utils/logger';

interface Guide {
  id: string;
  title: string;
  steps: string[];
  tips?: string[];
  icon?: string;
}

export default function UsageGuidePage() {
  const [expandedGuide, setExpandedGuide] = useState<string>('first-project');

  const guides: Guide[] = [
    {
      id: 'first-project',
      title: '📝 Creating Your First Project',
      icon: '🚀',
      steps: [
        'Go to the main dashboard (New Task tab)',
        'Describe what you need in the input field (e.g., "Create a modern logo for my coffee shop")',
        'Review the estimated cost shown at the bottom',
        'Click the "Execute Project" button',
        'Watch the real-time progress feed as agents work',
        'Review the deliverables when complete',
        'Click "Approve" to finalize or "Request Revision" for changes',
        'View your completed project in History'
      ],
      tips: [
        'Be specific with your requirements - more details = better results',
        'Include brand preferences like style, colors, and tone',
        'Projects typically take 30-60 seconds to complete',
        'Your wallet balance is deducted when the project completes'
      ]
    },
    {
      id: 'manage-wallet',
      title: '💰 Managing Your Wallet',
      icon: '🏦',
      steps: [
        'Click on the "Wallet" tab in the sidebar',
        'View your Total Balance, Available, and Locked amounts',
        'To add credits, click the "Deposit" button',
        'Enter the amount in HYPER credits',
        'Review the new balance preview',
        'Click "Confirm" to complete the deposit',
        'Your credits are immediately available for projects',
        'Monitor transaction history at the bottom of the page'
      ],
      tips: [
        'Always keep available balance above the project cost',
        'Locked balance will be released when projects complete',
        'Check transaction history for all wallet activity',
        'Deposits are instant - no waiting required'
      ]
    },
    {
      id: 'view-history',
      title: '📚 Reviewing Project History',
      icon: '⏰',
      steps: [
        'Click on the "History" tab in the sidebar',
        'Browse your completed projects',
        'Use the search bar to find specific projects',
        'Click on any project to see full details',
        'Use the icons to take actions:',
        '  • Repeat icon - Rerun with same settings',
        '  • Download icon - Download deliverables',
        '  • Trash icon - Delete project from history',
        'Click "Clear All" to remove all history (careful!)'
      ],
      tips: [
        'History persists even after closing the browser',
        'Search by project prompt text for quick access',
        'Rerun feature uses the exact same settings as before',
        'Downloaded files include all deliverables in one folder'
      ]
    },
    {
      id: 'understand-agents',
      title: '🤖 Understanding AI Agents',
      icon: '👾',
      steps: [
        'DesignBot: Creates logos, graphics, and visual assets',
        '  • Understands design preferences (minimalist, modern, etc.)',
        '  • Can implement specific color schemes',
        '  • Delivers high-quality image deliverables',
        'CopyBot: Generates text and creative copy',
        '  • Adapts tone to your brand voice',
        '  • Creates slogans, headlines, and content',
        '  • Delivers text-based deliverables',
        'ManagerAgent: Orchestrates the work',
        '  • Analyzes your request',
        '  • Determines which agents are needed',
        '  • Coordinates task execution'
      ],
      tips: [
        'Specify style preferences to guide DesignBot',
        'Describe brand voice to guide CopyBot',
        'More information = better agent performance',
        'Check agent status in the sidebar for real-time updates'
      ]
    },
    {
      id: 'prompts',
      title: '✍️ Writing Better Prompts',
      icon: '💬',
      steps: [
        'Include the main objective clearly',
        'Add specific style preferences (modern, minimalist, bold, etc.)',
        'Mention target audience or brand identity',
        'Specify color preferences if relevant',
        'Include tone/voice preferences for copy',
        'Example of a good prompt:',
        '  "Create a modern, minimalist logo for TechVision, a SaaS startup',
        '   targeting tech professionals. Use purple and cyan colors.',
        '   Style should be professional but approachable."',
        'The more detail you provide, the better the results'
      ],
      tips: [
        'Compare results from different prompt styles',
        'Save successful prompts for future use',
        'Be specific but not over-constrained',
        'Use examples or references in your description'
      ]
    },
    {
      id: 'review-approve',
      title: '✅ Reviewing & Approving Work',
      icon: '👓',
      steps: [
        'When a project completes, a review modal appears',
        'Review each deliverable carefully',
        'Check if it matches your requirements',
        'Three options available:',
        '  • Approve: Accept and complete the project',
        '  • Request Revision: Send back with feedback',
        '  • Reject: Cancel project and request refund',
        'Once approved, project moves to History',
        'Approved projects show as "completed" with green badge'
      ],
      tips: [
        'Take time to review before approving',
        'Provide specific feedback for revisions',
        'Remember approval is final - no changes after',
        'Check deliverable quality against your expectations'
      ]
    },
    {
      id: 'troubleshooting',
      title: '🔧 Troubleshooting Issues',
      icon: '⚙️',
      steps: [
        'Project stuck or timing out?',
        '  1. Wait a bit longer (agents may be processing)',
        '  2. Check network connection',
        '  3. Refresh the page if needed',
        'API not connecting (orange indicator)?',
        '  1. Check backend is running',
        '  2. Try switching to demo mode',
        '  3. Clear browser cache and reload',
        'Insufficient balance error?',
        '  1. Go to Wallet tab',
        '  2. Check your available balance',
        '  3. Add more credits if needed',
        'See console logs for detailed debugging (F12 → Console)'
      ],
      tips: [
        'The app logs everything to the browser console',
        'Open DevTools (F12) to see detailed error messages',
        'Check the API status indicator (green = connected)',
        'All operations are safely rolled back if they fail'
      ]
    },
    {
      id: 'keyboard-shortcuts',
      title: '⌨️ Keyboard Shortcuts',
      icon: '🎮',
      steps: [
        'F12: Open developer console (for viewing logs)',
        'Ctrl/Cmd + Shift + Delete: Clear browser cache',
        'Tab: Navigate between elements',
        'Enter: Submit forms or activate buttons',
        'Esc: Close modals and popup dialogs',
        'Space: Toggle button states',
        'Helpful console commands in DevTools:',
        '  • localStorage.getItem("hypertask_history"): View project history',
        '  • localStorage.getItem("hypertask_logs"): View app logs'
      ],
      tips: [
        'Use F12 to access detailed app logging',
        'Console logs show all API calls and errors',
        'Every action is logged with timestamps',
        'Export logs for debugging support issues'
      ]
    }
  ];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={28} className="text-primary" />
            <h1 className="text-3xl font-bold">Usage Guide</h1>
          </div>
          <p className="text-gray-400">Step-by-step tutorials for using HyperTask</p>
        </div>

        {/* Quick Start Card */}
        <div className="glass rounded-lg p-6 border border-primary/20 bg-primary/5">
          <h2 className="text-lg font-semibold mb-3">🚀 Quick Start</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex gap-3">
              <div className="text-2xl">1️⃣</div>
              <div>
                <p className="font-semibold">Describe Your Need</p>
                <p className="text-gray-400 text-xs">Enter what you want to create</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">2️⃣</div>
              <div>
                <p className="font-semibold">Execute Project</p>
                <p className="text-gray-400 text-xs">Agents process your request</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">3️⃣</div>
              <div>
                <p className="font-semibold">Review Results</p>
                <p className="text-gray-400 text-xs">Check deliverables</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">4️⃣</div>
              <div>
                <p className="font-semibold">Approve & Done</p>
                <p className="text-gray-400 text-xs">Complete your project</p>
              </div>
            </div>
          </div>
        </div>

        {/* Guides */}
        <div className="space-y-3">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="glass rounded-lg border border-primary/20 overflow-hidden"
            >
              <button
                onClick={() => setExpandedGuide(expandedGuide === guide.id ? '' : guide.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-primary/10 transition-colors text-left"
              >
                <h2 className="text-lg font-semibold text-white">{guide.title}</h2>
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 ${
                    expandedGuide === guide.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedGuide === guide.id && (
                <div className="border-t border-primary/20 p-4 space-y-4">
                  {/* Steps */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase">Steps</h3>
                    <ol className="space-y-2">
                      {guide.steps.map((step, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-gray-300 pt-0.5 whitespace-pre-wrap">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tips */}
                  {guide.tips && guide.tips.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase">💡 Tips</h3>
                      <ul className="space-y-2">
                        {guide.tips.map((tip, idx) => (
                          <li key={idx} className="flex gap-3">
                            <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Support */}
        <div className="glass rounded-lg p-6 border border-primary/20">
          <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>📖 Check the Documentation tab for API reference</p>
            <p>🐛 Open DevTools (F12) and check the Console tab for logs</p>
            <p>💬 Clear browser cache if you encounter issues</p>
            <p>🔄 All operations are automatically logged for troubleshooting</p>
          </div>
        </div>
      </div>
    </div>
  );
}
