import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { interpretSignal } from '@/lib/ai/interpretSignal';
import { upsertZipSignal } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.json();
  if (!data.zip || !/^\d{5}$/.test(data.zip)) {
    return NextResponse.json({ error: 'Invalid zip code' }, { status: 400 });
  }

  const result = await interpretSignal(data);

  await upsertZipSignal({
    zip_code: data.zip,
    signal_type: 'composite',
    signal_score: result.signal_score,
    permit_volume_score: result.permit_volume_score,
    permit_value_score: result.permit_value_score,
    permit_type_score: result.permit_type_score,
    permit_momentum_score: result.permit_momentum_score,
    vacancy_level_score: result.vacancy_level_score,
    vacancy_direction_score: result.vacancy_direction_score,
    vacancy_duration_score: result.vacancy_duration_score,
    lease_density_score: result.lease_density_score,
    lease_sqft_score: result.lease_sqft_score,
    lease_timing_score: result.lease_timing_score,
    ai_confidence_score: result.ai_confidence_score,
    data_completeness: data.dataCompleteness ?? null,
    raw_value: null,
    pct_change_30d: null,
    pct_change_90d: null,
    ai_interpretation: result.interpretation,
    ai_score_rationale: result.score_rationale,
    data_snapshot: data,
  });

  return NextResponse.json(result);
}
