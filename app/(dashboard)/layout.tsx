import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-navy-950">
      <Sidebar />
      {/* On mobile, push content below the fixed top bar */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0 min-w-0">
        {children}
      </main>
    </div>
  );
}
