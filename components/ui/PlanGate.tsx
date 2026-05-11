'use client';

import { useUser } from '@clerk/nextjs';

type PlanKey = 'starter' | 'pro' | 'team';

type Props = {
  requiredPlan: PlanKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

const PLAN_RANK: Record<PlanKey, number> = { starter: 0, pro: 1, team: 2 };

export function PlanGate({ requiredPlan, children, fallback }: Props) {
  const { user } = useUser();
  const currentPlan = (user?.publicMetadata?.plan as PlanKey) ?? 'starter';

  const hasAccess = PLAN_RANK[currentPlan] >= PLAN_RANK[requiredPlan];

  if (!hasAccess) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex flex-col items-center justify-center p-8 border border-navy-700 rounded-xl bg-navy-800/50 text-center">
        <div className="text-2xl mb-2">🔒</div>
        <p className="text-slate-300 font-medium mb-1">
          {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} plan required
        </p>
        <p className="text-slate-500 text-sm mb-4">Upgrade to unlock this feature</p>
        <a
          href="/settings?tab=billing"
          className="px-4 py-2 bg-teal-400 text-navy-900 font-semibold rounded-lg text-sm hover:bg-teal-500 transition-colors"
        >
          Upgrade Plan
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
