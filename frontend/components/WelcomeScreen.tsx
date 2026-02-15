'use client';

import React, { useState } from 'react';
import { Send, Sparkles, Zap, MessageCircle } from 'lucide-react';
import ChatInterface from './ChatInterface';

interface WelcomeScreenProps {
  onSubmit: (prompt: string) => void;
  // apiUrl: string;
}

export default function WelcomeScreen({ onSubmit }: WelcomeScreenProps) {
  const [prompt, setPrompt] = useState('');
  const [showChat, setShowChat] = useState(false);

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

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  const handleTaskReady = (taskPrompt: string) => {
    onSubmit(taskPrompt);
  };

  if (showChat) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col p-2 sm:p-4">
        <div className="flex-1 max-w-4xl w-full mx-auto glass rounded-2xl border border-primary/20 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-primary" size={20} />
              <h2 className="font-bold text-lg">Chat with Assistant</h2>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ✕ Close
            </button>
          </div>

          {/* Chat Interface */}
          <ChatInterface onTaskReady={handleTaskReady} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-4xl w-full space-y-6 sm:space-y-8 fade-in">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 glass px-3 sm:px-4 py-2 rounded-full mb-2 sm:mb-4">
            <Sparkles className="text-primary animate-pulse" size={18} />
            <span className="text-xs sm:text-sm font-medium">AI-Powered Agent Marketplace</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold px-4">
            Welcome to{' '}
            <span className="gradient-text">HyperTask</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
            Describe your goal to start. Our AI agents will handle the rest.
          </p>
        </div>

        {/* Chat Button - Prominent */}
        <div className="text-center">
          <button
            onClick={() => setShowChat(true)}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-base sm:text-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/50"
          >
            <MessageCircle size={20} />
            Chat with AI Assistant
          </button>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Or use quick start below
          </p>
        </div>

        {/* Example Prompts */}
        <div className="space-y-3 px-2">
          <p className="text-xs sm:text-sm text-gray-500 font-medium">Quick Start Examples:</p>
          <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="glass p-3 sm:p-4 rounded-xl text-left hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <Zap className="text-primary mt-0.5 sm:mt-1 group-hover:scale-110 transition-transform flex-shrink-0" size={16} />
                  <span className="text-xs sm:text-sm text-gray-300 group-hover:text-white transition-colors">
                    {example}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative px-2">
          <div className="glass rounded-2xl border-2 border-primary/30 focus-within:border-primary focus-within:shadow-lg focus-within:shadow-primary/20 transition-all duration-300">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Or type your goal here..."
              className="w-full bg-transparent px-4 sm:px-6 py-3 sm:py-4 pr-12 sm:pr-14 text-white placeholder-gray-500 focus:outline-none text-sm sm:text-base md:text-lg"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/50"
            >
              <Send size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </form>

        {/* Demo Button */}
        <div className="text-center px-2">
          <button
            onClick={() => onSubmit("Launch a coffee brand called 'JavaJoy'")}
            className="inline-flex items-center gap-2 glass px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-primary/20 transition-all duration-300 group text-sm sm:text-base"
          >
            <Sparkles className="text-primary group-hover:rotate-12 transition-transform" size={16} />
            <span className="font-medium">Run Demo Task</span>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="glass rounded-2xl p-4 sm:p-6 mx-2">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">145K</div>
              <div className="text-[10px] sm:text-xs md:text-sm text-gray-400 mt-1">HYPER Paid</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">320</div>
              <div className="text-[10px] sm:text-xs md:text-sm text-gray-400 mt-1">Active Agents</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">1,250</div>
              <div className="text-[10px] sm:text-xs md:text-sm text-gray-400 mt-1">Jobs Done</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}