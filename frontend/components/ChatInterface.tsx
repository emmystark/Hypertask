'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Image as ImageIcon, FileText, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  formatted?: boolean;
}

interface ChatInterfaceProps {
  onTaskReady: (conversationId: string) => void;
  apiUrl?: string;
}

export default function ChatInterface({ onTaskReady, apiUrl }: ChatInterfaceProps) {
  // Use provided apiUrl or fallback to environment variable or localhost
  const API_URL = apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey there! 👋 I'm your **HyperTask AI Assistant**.\n\nI can help you create:\n\n• **Logo Design** (50 HYPER) - Professional branding\n• **Copywriting** (20 HYPER) - Slogans, headlines, content\n• **Landing Pages** (25 HYPER) - Complete web copy\n• **Pitch Decks** (30 HYPER) - Investor presentations\n• **Full Packages** - Logo + Copy bundles\n\nJust tell me what you need! Try:\n- \"Create a logo for my coffee brand\"\n- \"Write a landing page for my SaaS app\"\n- \"I need a pitch deck for my startup\"",
      timestamp: Date.now(),
      formatted: true
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

  useEffect(() => {
    console.log('ChatInterface using API URL:', API_URL);
  }, [API_URL]);

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
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      console.log('Chat response:', data);

      // Store conversation ID
      if (!conversationId && data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // Add assistant response with formatting
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
        formatted: true
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update ready state
      if (data.ready_to_execute) {
        setReadyToExecute(true);
        
        // Show confirmation after a brief delay
        setTimeout(() => {
          const confirmMessage: Message = {
            role: 'assistant',
            content: ' **Ready to go!** I have all the details I need.\n\nClick **"Start Task"** below to begin creating your deliverables!',
            timestamp: Date.now(),
            formatted: true
          };
          setMessages(prev => [...prev, confirmMessage]);
        }, 500);
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: ` **Connection Issue**\n\nI'm having trouble connecting to the backend at:\n\`${API_URL}\`\n\n**Please make sure:**\n1. Backend is running: \`python3 api/main.py\`\n2. API is accessible at the URL above\n3. CORS is properly configured\n\n**Try these examples:**\n- "Create a modern logo for my fintech startup called PayEasy"\n- "Write a landing page for my SaaS project management tool"\n- "I need a pitch deck for my AI startup"`,
        timestamp: Date.now(),
        formatted: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = () => {
    if (conversationId) {
      onTaskReady(conversationId);
    }
  };

  const renderMessage = (message: Message) => {
    if (message.formatted) {
      return (
        <div className="prose prose-sm prose-invert max-w-none">
          <ReactMarkdown
            components={{
              // Custom rendering for better styling
              p: ({node, ...props}) => <p className="mb-2 last:mb-0 text-gray-300" {...props} />,
              ul: ({node, ...props}) => <ul className="mb-2 ml-4 space-y-1 list-disc text-gray-300" {...props} />,
              ol: ({node, ...props}) => <ol className="mb-2 ml-4 space-y-1 list-decimal text-gray-300" {...props} />,
              li: ({node, ...props}) => <li className="text-sm text-gray-300" {...props} />,
              strong: ({node, ...props}) => <strong className="text-primary font-semibold" {...props} />,
              code: ({node, className, children, ...props}: any) => {
                const isInline = !className?.includes('language-');
                return isInline 
                  ? <code className="bg-dark-700 px-1.5 py-0.5 rounded text-accent-cyan text-xs" {...props}>{children}</code>
                  : <code className="block bg-dark-700 p-2 rounded text-accent-cyan text-xs overflow-x-auto" {...props}>{children}</code>;
              },
              h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 text-primary" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 text-primary" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-base font-bold mb-1 text-primary" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary pl-3 italic text-gray-400" {...props} />,
              a: ({node, ...props}) => <a className="text-primary hover:text-secondary underline" {...props} />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      );
    }
    
    return (
      <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
        {message.content}
      </div>
    );
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
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                  <Sparkles className="text-primary flex-shrink-0" size={14} />
                  <span className="text-xs font-medium text-primary">HyperTask AI</span>
                </div>
              )}
              {renderMessage(message)}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl p-4 border border-primary/20">
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin text-primary" size={16} />
                <span className="text-sm text-gray-300">Analyzing your request...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-primary/20 bg-dark-800/80 backdrop-blur-sm">
        {readyToExecute && (
          <button
            onClick={handleStartTask}
            className="w-full mb-3 px-4 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-primary via-secondary to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/40 animate-pulse-slow"
          >
            <Sparkles size={20} className="animate-spin-slow" />
            <span className="text-sm sm:text-base">🚀 Start Creating</span>
            <CheckCircle2 size={20} />
          </button>
        )}
        
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={readyToExecute ? "Add any final details..." : "Tell me what you need..."}
            disabled={loading}
            className="w-full glass rounded-xl border border-primary/30 px-3 sm:px-4 py-3 sm:py-3.5 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:shadow-lg focus:shadow-primary/20 transition-all disabled:opacity-50 text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transition-all duration-300 shadow-md shadow-primary/30 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
        
        {/* Quick suggestions when not ready */}
        {!readyToExecute && messages.length === 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setInput("Create a modern logo for my tech startup")}
              className="text-xs px-3 py-1.5 rounded-full glass border border-primary/20 hover:border-primary/50 transition-all"
            >
              💡 Logo example
            </button>
            <button
              onClick={() => setInput("Write a landing page for my SaaS app")}
              className="text-xs px-3 py-1.5 rounded-full glass border border-primary/20 hover:border-primary/50 transition-all"
            >
              📝 Landing page
            </button>
            <button
              onClick={() => setInput("Create a pitch deck for investors")}
              className="text-xs px-3 py-1.5 rounded-full glass border border-primary/20 hover:border-primary/50 transition-all"
            >
               Pitch deck
            </button>
          </div>
        )}
        
        {/* Connection indicator */}
        {conversationId && (
          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
            <span>Connected • Session active</span>
          </div>
        )}
      </div>
    </div>
  );
}