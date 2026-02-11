'use client';

import React, { useState } from 'react';
import { Send, Sparkles, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onSubmit: (prompt: string) => void;
}

export default function WelcomeScreen({ onSubmit }: WelcomeScreenProps) {
  const [prompt, setPrompt] = useState('');

  const examplePrompts = [
    'Create a logo + slogan for my coffee brand',
    'Write a landing page copy for my crypto startup',
    'Generate a pitch deck outline',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8 fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4">
            <Sparkles className="text-primary animate-pulse" size={20} />
            <span className="text-sm font-medium">AI-Powered Agent Marketplace</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
            Welcome to{' '}
            <span className="gradient-text">HyperTask</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Describe your goal to start. Our AI agents will handle the rest.
          </p>
        </div>

        {/* Example Prompts */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium">Example Prompts:</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="glass p-4 rounded-xl text-left hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group"
              >
                <div className="flex items-start gap-3">
                  <Zap className="text-primary mt-1 group-hover:scale-110 transition-transform" size={18} />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {example}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="glass rounded-2xl border-2 border-primary/30 focus-within:border-primary focus-within:glow-primary transition-all duration-300">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your goal (e.g., 'Launch a coffee brand')..."
              className="w-full bg-transparent px-6 py-4 pr-14 text-white placeholder-gray-500 focus:outline-none text-lg"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all duration-300 glow-primary"
            >
              <Send size={20} />
            </button>
          </div>
        </form>

        {/* Demo Button */}
        <div className="text-center">
          <button
            onClick={() => onSubmit("Launch a coffee brand called 'JavaJoy'")}
            className="inline-flex items-center gap-2 glass px-6 py-3 rounded-xl hover:bg-primary/20 transition-all duration-300 group"
          >
            <Sparkles className="text-primary group-hover:rotate-12 transition-transform" size={18} />
            <span className="font-medium">Run Demo Task</span>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="glass rounded-2xl p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold gradient-text">145,000</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1">HYPER Paid</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold gradient-text">320</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1">Active Agents</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold gradient-text">1,250</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1">Jobs Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
