import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'CRE Signals — Commercial Real Estate Intelligence',
  description: 'AI-powered market signals for CRE brokers, developers, and lenders.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="bg-navy-900 text-slate-200 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
