'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const EXAMPLES = [
  'Add a new @ai-sdk/deepseek provider package with streaming and reasoning tokens',
  'Find security vulnerabilities in the authentication flow',
  'Add a /research command to the CLI that performs deep web research with citations',
];

interface Props {
  onSubmit: (message: string) => void;
  messages: Message[];
  isRunning: boolean;
}

function MarkdownContent({ content }: { content: string }) {
  // Simple markdown: bold, code, headers, lists
  const lines = content.split('\n');
  return (
    <div className="prose text-sm space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-base font-semibold text-white mt-3 mb-1">{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-semibold text-white mt-2">{line.slice(4)}</h3>;
        if (line.startsWith('- ')) {
          const text = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code>$1</code>');
          return <li key={i} className="ml-4 text-[#ccc]" dangerouslySetInnerHTML={{ __html: text }} />;
        }
        if (line.startsWith('**Goal:**')) {
          return <p key={i} className="text-[#aaa]"><strong className="text-white">Goal:</strong>{line.slice(9)}</p>;
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        const text = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code>$1</code>');
        return <p key={i} className="text-[#ccc]" dangerouslySetInnerHTML={{ __html: text }} />;
      })}
    </div>
  );
}

export function ChatPanel({ onSubmit, messages, isRunning }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isRunning) return;
    onSubmit(input.trim());
    setInput('');
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-white text-xl font-semibold mb-2">Agentnetes</h2>
            <p className="text-white/70 text-sm mb-1 max-w-sm">Zero to a Self-Organizing AI Agency. On Demand.</p>
            <p className="text-white/45 text-xs mb-8 max-w-sm">Zero to Agent? We are taking it further — basically Kubernetes for AI agents.</p>
            <div className="space-y-2 w-full max-w-sm">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(ex); }}
                  className="w-full text-left text-xs text-white/60 border border-white/10 rounded-lg px-3 py-2.5 hover:border-white/25 hover:text-white/80 transition-colors bg-white/[0.03]"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div className="max-w-[80%] bg-[#1a1a1a] border border-[#333] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm text-white">
                {msg.content}
              </div>
            ) : (
              <div className="max-w-[90%] bg-[#0d0d0d] border border-[#222] rounded-2xl rounded-bl-sm px-4 py-3">
                <MarkdownContent content={msg.content} />
              </div>
            )}
          </div>
        ))}

        {isRunning && (
          <div className="flex justify-start">
            <div className="bg-[#0d0d0d] border border-[#222] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-white/55 text-xs font-mono">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                Agents working...
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1a1a1a]">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isRunning}
            placeholder="Give the swarm a goal..."
            className="flex-1 bg-white/[0.04] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isRunning}
            className="bg-white text-black rounded-xl px-3 py-2.5 hover:bg-[#e0e0e0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
