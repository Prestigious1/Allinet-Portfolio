'use client';

/**
 * ALLI Slide-Over Drawer Component
 * TASK-P9-04 / F-028 / F-060..F-064
 *
 * Responsive AI concierge drawer accessible from the command header and as a
 * standalone /concierge page on mobile. Includes:
 *  - Suggested question chips
 *  - Streaming message list with source citations
 *  - Action buttons from the qualification state machine
 *  - ESC-to-close keyboard support
 *  - Lead capture prompt for high-intent visitors
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { qualify, type Message, type ActionButton } from '@/core/concierge/state-machine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AlliMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: ActionButton[];
  isStreaming?: boolean;
}

interface AlliDrawerProps {
  /** When true the drawer is open */
  open: boolean;
  /** Called when the drawer should close */
  onClose: () => void;
  /** If true, renders inline (full-page) rather than as an overlay drawer */
  inline?: boolean;
}

// ---------------------------------------------------------------------------
// Suggested Question Chips
// ---------------------------------------------------------------------------

const SUGGESTED_QUESTIONS = [
  "What technologies does Alli specialize in?",
  "How does the engagement process work?",
  "What kind of projects does Alli take on?",
  "Can I see live demos of Alli's work?",
  "How do I start a project with Alli?",
];

// ---------------------------------------------------------------------------
// Chat Message Component
// ---------------------------------------------------------------------------

function ChatBubble({ msg }: { msg: AlliMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      data-role={msg.role}
    >
      {!isUser && (
        <span
          aria-hidden="true"
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#07040d] font-bold text-xs font-mono"
        >
          AI
        </span>
      )}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        <div
          className={[
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-amber-500/20 border border-amber-400/30 text-amber-100 rounded-br-sm'
              : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-sm',
            msg.isStreaming ? 'animate-pulse' : '',
          ].join(' ')}
        >
          {msg.content || (msg.isStreaming ? '…' : '')}
        </div>

        {/* Action Buttons */}
        {msg.actions && msg.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {msg.actions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                target={action.href.startsWith('http') ? '_blank' : undefined}
                rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  action.variant === 'primary'
                    ? 'bg-amber-500 hover:bg-amber-400 text-[#07040d] font-semibold'
                    : action.variant === 'whatsapp'
                    ? 'bg-green-600/80 hover:bg-green-500 text-white border border-green-500/40'
                    : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15',
                ].join(' ')}
              >
                {action.variant === 'whatsapp' && (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.125.558 4.119 1.532 5.847L.044 23.418a.6.6 0 0 0 .734.722l5.771-1.511A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 0 1-5.001-1.368l-.36-.213-3.425.897.914-3.33-.234-.381A9.818 9.818 0 0 1 2.182 12C2.182 6.567 6.567 2.182 12 2.182c5.433 0 9.818 4.385 9.818 9.818 0 5.434-4.385 9.818-9.819 9.818z"/>
                  </svg>
                )}
                {action.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AlliDrawer Component
// ---------------------------------------------------------------------------

export function AlliDrawer({ open, onClose, inline = false }: AlliDrawerProps) {
  const [messages, setMessages] = useState<AlliMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ESC key to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Focus input when drawer opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: AlliMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);

      // Build history for the state machine
      const history: Message[] = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Run state machine to compute actions
      const { actions } = qualify(history);

      // Streaming placeholder
      const assistantId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', isStreaming: true },
      ]);

      try {
        const res = await fetch('/api/concierge', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Unknown error' }));
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content:
                      err.error ||
                      "I'm unable to respond right now. Please try again or visit /brief to get started.",
                    isStreaming: false,
                    actions: actions.length > 0 ? actions : undefined,
                  }
                : m
            )
          );
          return;
        }

        // Read SSE stream
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;

            // Extract text from SSE data lines
            const lines = accumulated.split('\n');
            accumulated = lines.pop() ?? '';

            let textAccumulated = '';
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;
                try {
                  const parsed = JSON.parse(data);
                  const delta =
                    parsed?.choices?.[0]?.delta?.content ||
                    parsed?.delta?.text ||
                    parsed?.text ||
                    '';
                  textAccumulated += delta;
                } catch {
                  // Plain text chunk
                  textAccumulated += data;
                }
              }
            }

            if (textAccumulated) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + textAccumulated, isStreaming: true }
                    : m
                )
              );
            }
          }
        }

        // Finalize
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  isStreaming: false,
                  actions: actions.length > 0 ? actions : undefined,
                }
              : m
          )
        );
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "I encountered an error. Please try again or visit /brief to get in touch.",
                  isStreaming: false,
                  actions: actions.length > 0 ? actions : undefined,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, sessionId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const content = (
    <div
      id="alli-drawer-panel"
      role="dialog"
      aria-label="ALLI AI Concierge"
      aria-modal={!inline}
      className={[
        'flex flex-col',
        inline
          ? 'h-full'
          : 'h-full bg-[#0d0914] border-l border-amber-400/15',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#0d0914]/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#07040d] font-bold text-xs font-mono"
          >
            AI
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-100 leading-tight">ALLI</p>
            <p className="text-xs text-amber-400/80 leading-tight">AI Concierge · Verified Facts Only</p>
          </div>
        </div>
        {!inline && (
          <button
            id="alli-drawer-close"
            onClick={onClose}
            aria-label="Close ALLI Concierge"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="space-y-4">
            {/* Welcome */}
            <div className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#07040d] font-bold text-xs font-mono"
              >
                AI
              </span>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-200 leading-relaxed max-w-[80%]">
                Hi! I&apos;m <strong className="text-amber-400">ALLI</strong>, Alli&apos;s AI Concierge. I can answer verified questions about his engineering background, tech stack, projects, and engagement process. What would you like to know?
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="pl-11">
              <p className="text-xs text-slate-500 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-amber-400/25 text-amber-300/80 hover:border-amber-400/50 hover:text-amber-300 hover:bg-amber-400/5 transition-all duration-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} />
        ))}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-white/8 px-4 py-3 bg-[#0d0914]/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <label htmlFor="alli-chat-input" className="sr-only">
            Message ALLI
          </label>
          <textarea
            ref={inputRef}
            id="alli-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about Alli…"
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-white/5 border border-white/12 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 resize-none focus:outline-none focus:border-amber-400/40 focus:bg-white/8 transition-all duration-200 disabled:opacity-50 max-h-32 overflow-y-auto"
            style={{ minHeight: '40px' }}
          />
          <button
            type="submit"
            id="alli-chat-send"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#07040d] transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </form>
        <p className="text-[10px] text-slate-600 mt-1.5 text-center">
          ALLI only answers using verified facts from Alli&apos;s portfolio. Press Esc to close.
        </p>
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-over panel */}
      <div
        className={[
          'fixed right-0 top-0 bottom-0 z-50 w-full max-w-md transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        aria-hidden={!open}
      >
        {content}
      </div>
    </>
  );
}
