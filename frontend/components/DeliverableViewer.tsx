'use client';

import React, { useState } from 'react';
import { Download, Copy, Check, FileText, Image as ImageIcon, Presentation, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Deliverable {
  id: string;
  type: 'image' | 'markdown' | 'text' | 'content';
  name: string;
  content: string | any;
  agent?: string;
  metadata?: any;
}

interface DeliverableViewerProps {
  deliverables: Deliverable[];
  brandName?: string;
}

export default function DeliverableViewer({ deliverables, brandName }: DeliverableViewerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(deliverables[0]?.id || '');

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = (deliverable: Deliverable) => {
    try {
      if (deliverable.type === 'image') {
        // Download image
        const link = document.createElement('a');
        link.href = deliverable.content;
        link.download = `${deliverable.name}.png`;
        link.click();
      } else {
        // Download text/markdown
        const content = typeof deliverable.content === 'string' 
          ? deliverable.content 
          : JSON.stringify(deliverable.content, null, 2);
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${deliverable.name}.md`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const renderDeliverable = (deliverable: Deliverable) => {
    switch (deliverable.type) {
      case 'image':
        return (
          <div className="space-y-4">
            <div className="glass rounded-xl p-6 border border-primary/20">
              <div className="flex items-center justify-center bg-white rounded-lg p-4">
                <img 
                  src={deliverable.content} 
                  alt={deliverable.name}
                  className="max-w-full h-auto max-h-96 object-contain"
                />
              </div>
            </div>
            
            {deliverable.metadata && (
              <div className="glass rounded-lg p-4 border border-primary/10">
                <h4 className="text-sm font-semibold text-primary mb-2">Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                  {deliverable.metadata.size && (
                    <div>
                      <span className="text-gray-500">Size:</span>{' '}
                      {deliverable.metadata.size[0]} × {deliverable.metadata.size[1]}
                    </div>
                  )}
                  {deliverable.metadata.format && (
                    <div>
                      <span className="text-gray-500">Format:</span>{' '}
                      {deliverable.metadata.format}
                    </div>
                  )}
                  {deliverable.metadata.model_used && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Model:</span>{' '}
                      {deliverable.metadata.model_used}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'markdown':
      case 'text':
        const content = typeof deliverable.content === 'string' 
          ? deliverable.content 
          : JSON.stringify(deliverable.content, null, 2);

        return (
          <div className="space-y-4">
            <div className="glass rounded-xl p-6 border border-primary/20 max-h-[600px] overflow-y-auto">
              <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => (
                      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-primary border-b border-primary/20 pb-2" {...props} />
                    ),
                    h2: ({node, ...props}) => (
                      <h2 className="text-xl sm:text-2xl font-bold mb-3 mt-6 text-primary" {...props} />
                    ),
                    h3: ({node, ...props}) => (
                      <h3 className="text-lg sm:text-xl font-bold mb-2 mt-4 text-secondary" {...props} />
                    ),
                    p: ({node, ...props}) => (
                      <p className="mb-4 leading-relaxed text-gray-300" {...props} />
                    ),
                    ul: ({node, ...props}) => (
                      <ul className="mb-4 ml-6 space-y-2 list-disc text-gray-300" {...props} />
                    ),
                    ol: ({node, ...props}) => (
                      <ol className="mb-4 ml-6 space-y-2 list-decimal text-gray-300" {...props} />
                    ),
                    li: ({node, ...props}) => (
                      <li className="text-gray-300" {...props} />
                    ),
                    strong: ({node, ...props}) => (
                      <strong className="text-primary font-semibold" {...props} />
                    ),
                    em: ({node, ...props}) => (
                      <em className="text-secondary" {...props} />
                    ),
                    code: ({node, className, children, ...props}: any) => {
                      const isInline = !className?.includes('language-');
                      return isInline 
                        ? <code className="bg-dark-700 px-2 py-1 rounded text-accent-cyan text-sm" {...props}>{children}</code>
                        : <code className="block bg-dark-700 p-4 rounded-lg text-accent-cyan text-sm overflow-x-auto" {...props}>{children}</code>;
                    },
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-gray-400 my-4" {...props} />
                    ),
                    hr: ({node, ...props}) => (
                      <hr className="border-primary/20 my-6" {...props} />
                    ),
                    a: ({node, ...props}) => (
                      <a className="text-primary hover:text-secondary underline transition-colors" {...props} />
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>

            {deliverable.metadata && (
              <div className="glass rounded-lg p-4 border border-primary/10">
                <h4 className="text-sm font-semibold text-primary mb-2">Content Info</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                  {deliverable.metadata.copy_type && (
                    <div>
                      <span className="text-gray-500">Type:</span>{' '}
                      {deliverable.metadata.copy_type.replace('_', ' ').toUpperCase()}
                    </div>
                  )}
                  {deliverable.metadata.word_count && (
                    <div>
                      <span className="text-gray-500">Words:</span>{' '}
                      {deliverable.metadata.word_count}
                    </div>
                  )}
                  {deliverable.metadata.industry && (
                    <div>
                      <span className="text-gray-500">Industry:</span>{' '}
                      {deliverable.metadata.industry.toUpperCase()}
                    </div>
                  )}
                  {deliverable.metadata.slides && (
                    <div>
                      <span className="text-gray-500">Slides:</span>{' '}
                      {deliverable.metadata.slides}
                    </div>
                  )}
                  {deliverable.metadata.techniques_used && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Techniques:</span>{' '}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {deliverable.metadata.techniques_used.slice(0, 3).map((tech: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                            {tech.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="glass rounded-xl p-6 border border-primary/20">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
              {JSON.stringify(deliverable.content, null, 2)}
            </pre>
          </div>
        );
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={16} />;
      case 'markdown':
      case 'text':
        return <FileText size={16} />;
      case 'content':
        return <Presentation size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  if (deliverables.length === 0) {
    return (
      <div className="glass rounded-xl p-8 border border-primary/20 text-center">
        <p className="text-gray-400">No deliverables yet. Start a conversation to create something amazing!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass rounded-xl p-4 border border-primary/20">
        <h2 className="text-xl font-bold text-primary mb-1">
          🎉 Your Deliverables {brandName && `for ${brandName}`}
        </h2>
        <p className="text-sm text-gray-400">
          {deliverables.length} item{deliverables.length !== 1 ? 's' : ''} created • Click to download or copy
        </p>
      </div>

      {/* Tabs */}
      {deliverables.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {deliverables.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveTab(d.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === d.id
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'glass border border-primary/20 text-gray-300 hover:border-primary/50'
              }`}
            >
              {getIcon(d.type)}
              <span>{d.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active deliverable */}
      {deliverables.map((deliverable) => (
        activeTab === deliverable.id && (
          <div key={deliverable.id} className="space-y-4">
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDownload(deliverable)}
                className="px-4 py-2 rounded-lg glass border border-primary/20 hover:border-primary/50 transition-all flex items-center gap-2 text-sm font-medium"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
              
              {deliverable.type !== 'image' && (
                <button
                  onClick={() => {
                    const content = typeof deliverable.content === 'string'
                      ? deliverable.content
                      : JSON.stringify(deliverable.content, null, 2);
                    handleCopy(content, deliverable.id);
                  }}
                  className="px-4 py-2 rounded-lg glass border border-primary/20 hover:border-primary/50 transition-all flex items-center gap-2 text-sm font-medium"
                >
                  {copiedId === deliverable.id ? (
                    <>
                      <Check size={16} className="text-accent-green" />
                      <span className="text-accent-green">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}

              <div className="ml-auto px-3 py-2 rounded-lg glass border border-primary/10 text-xs text-gray-400 flex items-center gap-2">
                <span>Created by</span>
                <span className="font-semibold text-primary">{deliverable.agent}</span>
              </div>
            </div>

            {/* Content */}
            {renderDeliverable(deliverable)}
          </div>
        )
      ))}
    </div>
  );
}