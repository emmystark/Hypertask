'use client';

import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="typing-indicator">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      <span className="text-xs text-gray-400 ml-2">Agent thinking...</span>
    </div>
  );
}
