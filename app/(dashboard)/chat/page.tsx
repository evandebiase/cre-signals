import { ChatInterface } from '@/components/chat/ChatInterface';

export const metadata = { title: 'AI Analyst — CRE Signals' };

export default function ChatPage() {
  return (
    <div className="px-4 sm:px-8 py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">AI Signal Analyst</h1>
        <p className="text-slate-500 text-sm mt-1">
          Ask questions about your market data — powered by Claude with live signal context
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
