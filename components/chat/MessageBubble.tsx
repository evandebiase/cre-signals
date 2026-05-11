'use client';

import { clsx } from 'clsx';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

type Props = { message: Message; streaming?: boolean };

export function MessageBubble({ message, streaming }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={clsx('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={clsx(
          'w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5',
          isUser ? 'bg-teal-400/20 text-teal-400' : 'bg-blue-500/20 text-blue-400'
        )}
      >
        {isUser ? 'U' : 'AI'}
      </div>
      <div
        className={clsx(
          'max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-teal-400/10 border border-teal-400/20 text-slate-200 text-right'
            : 'bg-navy-900 border border-navy-700 text-slate-300'
        )}
      >
        {message.content || (streaming ? (
          <span className="inline-flex gap-1">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        ) : null)}
        {streaming && message.content && (
          <span className="inline-block w-0.5 h-4 bg-teal-400 animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </div>
  );
}
