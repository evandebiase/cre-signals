import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">CRE Data</h1>
          <p className="text-slate-500">7-day free trial · No credit card required</p>
        </div>
        <SignUp fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
