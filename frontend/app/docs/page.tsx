'use client';

import React, { useState } from 'react';
import { FileText, ChevronDown, Search, Copy, Check } from 'lucide-react';
import { logger } from '@/utils/logger';

interface DocSection {
  id: string;
  title: string;
  content: string;
  code?: string;
}

export default function DocsPage() {
  const [expandedSection, setExpandedSection] = useState<string>('getting-started');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const docs: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: 'HyperTask is an AI-powered agent marketplace that helps you generate designs, copy, and other creative assets. Simply describe what you need, and our AI agents will deliver quality results.',
      code: `// Submit a task
const prompt = "Create a logo for my coffee shop called BrewHaven";\n// Our AI agents process your request and deliver results`
    },
    {
      id: 'how-it-works',
      title: 'How It Works',
      content: 'When you submit a task, our Manager Agent analyzes your request, determines which agents are needed (DesignBot for visuals, CopyBot for text), allocates resources, and coordinates the work. Results are delivered with full transparency on costs.',
      code: `// Cost breakdown:
// DesignBot: $50 per project
// CopyBot: $20 per project
// Burn Fee: 5% of total cost`
    },
    {
      id: 'agents',
      title: 'Our Agents',
      content: `DesignBot: Specialized in creating logos, graphics, and visual assets. Can understand design preferences and create minimalist, modern, or custom styles.\n\nCopyBot: Generates compelling copy including slogans, headlines, and content. Adapts tone to your brand voice.\n\nManagerAgent: Orchestrates the work, analyzes requests, and ensures quality delivery.`,
      code: `// Check agent status
GET /agents\n// Response shows all available agents and their status`
    },
    {
      id: 'wallet',
      title: 'Wallet & Payments',
      content: 'Your wallet holds HYPER credits used to pay for agent work. Deposit credits anytime, and they\'ll be available immediately. When you execute a project, credits are locked in escrow and released upon completion.',
      code: `// Wallet states:
// Available: Ready to use
// Locked: In active projects
// Total: Available + Locked`
    },
    {
      id: 'projects',
      title: 'Managing Projects',
      content: 'Track all your projects in the History page. View completed work, review costs, and rerun successful projects. All deliverables are preserved for download and reference.',
      code: `// Project lifecycle:
// 1. Submit prompt
// 2. Agents process (show in real-time)
// 3. Review deliverables
// 4. Approve or request revision
// 5. Project complete`
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      content: 'For best results: Be specific in your prompts. Include brand details, style preferences, and tone. The more context you provide, the better the results. Review deliverables carefully and provide feedback for revisions if needed.',
      code: `// Good prompt:
"Create a modern minimalist logo for TechVision, a SaaS startup. Use purple and cyan colors. Style should be professional yet approachable."\n// Better prompts lead to faster execution and higher quality`
    },
    {
      id: 'api',
      title: 'API Reference',
      content: 'HyperTask provides a REST API for programmatic access. All endpoints require authentication and return JSON responses. Rate limits apply.',
      code: `// Example API call:
POST /execute
{\n  "prompt": "Create a logo for my brand",\n  "context": {\n    "brand_voice": "professional",\n    "colors": ["#FF6B6B", "#4ECDC4"]\n  }\n}`
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      content: 'If you encounter issues: Check your wallet balance. Verify internet connection. Try clearing browser cache. If agents are offline, check the API status. For persistent issues, contact support.',
      code: `// Check API health:
GET /health\n// Should return: {"status": "healthy"}`
    }
  ];

  const filteredDocs = docs.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    logger.info('DocsPage', 'Code copied to clipboard', { docId: id });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileText size={28} className="text-primary" />
            <h1 className="text-3xl font-bold">Documentation</h1>
          </div>
          <p className="text-gray-400">Complete guide to using HyperTask</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-700 border border-primary/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Documentation Sections */}
        <div className="space-y-3">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="glass rounded-lg border border-primary/20 overflow-hidden"
            >
              <button
                onClick={() => setExpandedSection(expandedSection === doc.id ? '' : doc.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-primary/10 transition-colors text-left"
              >
                <h2 className="text-lg font-semibold text-white">{doc.title}</h2>
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 ${
                    expandedSection === doc.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedSection === doc.id && (
                <div className="border-t border-primary/20 p-4 space-y-4">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{doc.content}</p>

                  {doc.code && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Code Example:</span>
                        <button
                          onClick={() => copyToClipboard(doc.code!, doc.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
                        >
                          {copiedCode === doc.id ? (
                            <>
                              <Check size={14} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto border border-primary/10">
                        <code className="text-gray-300 text-sm font-mono">{doc.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredDocs.length === 0 && (
          <div className="glass rounded-lg p-12 text-center border border-primary/20">
            <p className="text-gray-400">No documentation found matching your search.</p>
          </div>
        )}

        {/* Tips Section */}
        <div className="glass rounded-lg p-6 border border-primary/20 bg-primary/5">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            💡 Pro Tips
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Start with clear, detailed prompts for better results</li>
            <li>• Check your wallet balance before submitting large projects</li>
            <li>• Use History to review and rerun successful projects</li>
            <li>• Monitor the task execution feed in real-time during processing</li>
            <li>• Provide feedback on deliverables to help agents improve</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
