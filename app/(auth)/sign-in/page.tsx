import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">CRE Data</h1>
          <p className="text-slate-500">Commercial Real Estate Intelligence Platform</p>
        </div>
        <SignIn fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
