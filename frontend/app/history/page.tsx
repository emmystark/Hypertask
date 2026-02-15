'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Download, Repeat2, Trash2, Search } from 'lucide-react';
import { logger } from '@/utils/logger';

interface HistoryItem {
  id: string;
  prompt: string;
  status: 'completed' | 'failed' | 'pending';
  timestamp: string;
  cost: number;
  deliverables: { type: string; name: string }[];
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.info('HistoryPage', 'Loading project history');
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Load from localStorage
      const stored = localStorage.getItem('hypertask_history');
      if (stored) {
        const items = JSON.parse(stored);
        setHistory(items);
        logger.success('HistoryPage', 'History loaded successfully', { count: items.length });
      } else {
        logger.info('HistoryPage', 'No history found');
      }
    } catch (error) {
      logger.error('HistoryPage', 'Failed to load history', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
    logger.info('HistoryPage', 'History item deleted', { id });
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      localStorage.removeItem('hypertask_history');
      logger.info('HistoryPage', 'All history cleared');
    }
  };

  const filteredHistory = history.filter(item =>
    item.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-yellow-400 bg-yellow-400/10';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Clock size={28} className="text-primary" />
            <h1 className="text-3xl font-bold">Project History</h1>
          </div>
          <p className="text-gray-400">View and manage your past project executions</p>
        </div>

        {/* Search and Actions */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-700 border border-primary/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={clearAll}
            disabled={history.length === 0}
            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Trash2 size={18} />
            Clear All
          </button>
        </div>

        {/* History List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">🔄</div>
            <p className="mt-2 text-gray-400">Loading history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Clock size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">
              {history.length === 0 ? 'No projects yet' : 'No matching projects found'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="glass rounded-lg p-4 border border-primary/20 hover:border-primary/50 transition-all hover:bg-primary/5 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(item.status)}`}>
                        {item.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{item.timestamp}</span>
                    </div>
                    <p className="text-white font-medium mb-2 break-words">{item.prompt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span> ${item.cost.toFixed(2)}</span>
                      <span>📦 {item.deliverables.length} deliverables</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        logger.info('HistoryPage', 'Rerun project', { id: item.id });
                      }}
                      className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                      title="Rerun this project"
                    >
                      <Repeat2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        logger.info('HistoryPage', 'Download deliverables', { id: item.id });
                      }}
                      className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                      title="Download deliverables"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      title="Delete this project"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
