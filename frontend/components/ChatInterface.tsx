'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatInterfaceProps {
  onTaskReady: (prompt: string) => void;
  apiUrl?: string;
}

export default function ChatInterface({ onTaskReady, apiUrl }: ChatInterfaceProps) {
  // Use provided apiUrl or fallback to environment variable or localhost
  const API_URL = apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Log API URL for debugging
  useEffect(() => {
    console.log('ChatInterface using API URL:', API_URL);
  }, [API_URL]);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey there! 👋 I'm your HyperTask Assistant.\n\nI can help you with:\n• Logo & Brand Design (50 HYPER)\n• Copywriting & Slogans (20 HYPER)\n• Pitch Decks (30 HYPER)\n• Landing Pages (25 HYPER)\n\nWhat would you like to create today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [readyToExecute, setReadyToExecute] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      console.log('Sending chat request to:', `${API_URL}/chat`);
      
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          conversation_id: conversationId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Chat response:', data);

      // Store conversation ID
      if (!conversationId && data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update ready state
      if (data.ready_to_execute) {
        setReadyToExecute(true);
        
        // Show confirmation message
        setTimeout(() => {
          const confirmMessage: Message = {
            role: 'assistant',
            content: '✨ Perfect! I\'ve analyzed your request. Click "Start Task" below to begin!',
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, confirmMessage]);
        }, 500);
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: `⚠️ I'm having trouble connecting to the backend at ${API_URL}\n\nPlease make sure:\n1. Backend is running: python3 api/main.py\n2. API is accessible at ${API_URL}\n\nTry: "Create a logo for my coffee brand" or "Write a landing page for my startup"`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = () => {
    // Get the last user message as the task prompt
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (lastUserMessage) {
      onTaskReady(lastUserMessage.content);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] md:max-w-[70%] rounded-2xl p-3 sm:p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white'
                  : 'glass border border-primary/20'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-primary flex-shrink-0" size={14} />
                  <span className="text-xs text-gray-400">HyperTask Assistant</span>
                </div>
              )}
              <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
                {message.content}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl p-4 border border-primary/20">
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-primary" size={16} />
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-primary/20 bg-dark-800/50">
        {readyToExecute && (
          <button
            onClick={handleStartTask}
            className="w-full mb-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
          >
            <Sparkles size={18} />
            <span className="text-sm sm:text-base">Start Task</span>
          </button>
        )}
        
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="w-full glass rounded-xl border border-primary/30 px-3 sm:px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:shadow-lg focus:shadow-primary/20 transition-all disabled:opacity-50 text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/30"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
        
        {/* Connection Status */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          {conversationId ? (
            <span className="text-accent-green">● Connected to {API_URL}</span>
          ) : (
            <span className="text-gray-400">Ready to chat</span>
          )}
        </div>
      </div>
    </div>
  );
}