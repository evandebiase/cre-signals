// Run nightly: compute AI signal scores for all watched zips
import { getDb } from '../lib/db/client';
import { fetchPermitsForZip, computePermitStats } from '../lib/data/permits';
import { fetchVacancyByZip } from '../lib/data/census';
import { getLeasesByZip } from '../lib/db/queries';
import { interpretSignal } from '../lib/ai/interpretSignal';
import { upsertZipSignal } from '../lib/db/queries';

async function getWatchedZips(): Promise<string[]> {
  const db = getDb();
  const result = await db`SELECT DISTINCT zip_code FROM user_watchlists`;
  return result.map(r => r.zip_code as string);
}

export async function run() {
  const zips = await getWatchedZips();
  console.log(`Scoring signals for ${zips.length} zip codes...`);

  for (const zip of zips) {
    try {
      const [permits90d, permitBaseline, vacancyData, leases] = await Promise.all([
        fetchPermitsForZip(zip, 90),
        fetchPermitsForZip(zip, 365),
        fetchVacancyByZip(zip),
        getLeasesByZip(zip),
      ]);

      const stats90d = computePermitStats(permits90d);
      const baselineStats = computePermitStats(permitBaseline);

      // Compute baseline per 90d period
      const baselinePer90 = Math.round(baselineStats.total / 4);

      // Lease timing
      const now = Date.now();
      const leaseExpirations = leases.map(l => {
        if (!l.expiration_quarter) return Infinity;
        const [q, y] = l.expiration_quarter.split(' ');
        const quarterMap: Record<string, number> = { Q1: 0, Q2: 3, Q3: 6, Q4: 9 };
        const month = quarterMap[q] ?? 0;
        return new Date(parseInt(y), month, 1).getTime();
      });

      const nearestDays = leaseExpirations.length > 0
        ? Math.round((Math.min(...leaseExpirations) - now) / 86400000)
        : 999;
      const medianDays = leaseExpirations.length > 0
        ? Math.round((leaseExpirations.sort((a, b) => a - b)[Math.floor(leaseExpirations.length / 2)] - now) / 86400000)
        : 999;

      const totalSqft = leases.reduce((s, l) => s + (l.sq_footage ?? 0), 0);

      let dataCompleteness = 1.0;
      if (permits90d.length === 0) dataCompleteness -= 0.3;
      if (!vacancyData) dataCompleteness -= 0.3;
      if (leases.length === 0) dataCompleteness -= 0.2;

      const signalInput = {
        zip,
        permitCount: stats90d.total,
        permitBaseline: baselinePer90,
        permitTotalValue: stats90d.totalValue,
        permitValueMedian: baselineStats.totalValue / 4,
        dominantType: stats90d.dominantType,
        permitTypeBreakdown: JSON.stringify(stats90d.typeCounts),
        permitMomChanges: `${stats90d.momChange.toFixed(1)}% MoM`,
        vacancyRate: vacancyData?.vacancy_rate ?? 10,
        vacancyChange: 0, // would need historical to compute
        avgVacancyDays: 120, // default — would need more data
        leaseCount: leases.length,
        zipAreaSqMiles: 3.5, // default — would need geo data
        leaseSqft: totalSqft,
        nearestExpirationDays: nearestDays,
        medianExpirationDays: medianDays,
        dataCompleteness,
      };

      const result = await interpretSignal(signalInput);

      await upsertZipSignal({
        zip_code: zip,
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
        data_completeness: dataCompleteness,
        raw_value: null,
        pct_change_30d: null,
        pct_change_90d: null,
        ai_interpretation: result.interpretation,
        ai_score_rationale: result.score_rationale,
        data_snapshot: signalInput as unknown as Record<string, unknown>,
      });

      console.log(`${zip}: score=${result.signal_score}, type=${result.signal_type}`);
    } catch (err) {
      console.error(`Error scoring zip ${zip}:`, err);
    }

    // Rate limit Claude API — 1 req/sec
    await new Promise(r => setTimeout(r, 1000));
  }
}

if (require.main === module) {
  run().catch(console.error);
}
