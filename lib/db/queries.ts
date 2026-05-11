import { getDb } from './client';

function sql(...args: Parameters<ReturnType<typeof getDb>>) {
  return getDb()(...args as Parameters<ReturnType<typeof getDb>>);
}

export type ZipSignal = {
  id: string;
  zip_code: string;
  signal_type: string;
  signal_score: number;
  permit_volume_score: number | null;
  permit_value_score: number | null;
  permit_type_score: number | null;
  permit_momentum_score: number | null;
  vacancy_level_score: number | null;
  vacancy_direction_score: number | null;
  vacancy_duration_score: number | null;
  lease_density_score: number | null;
  lease_sqft_score: number | null;
  lease_timing_score: number | null;
  ai_confidence_score: number | null;
  data_completeness: number | null;
  raw_value: number | null;
  pct_change_30d: number | null;
  pct_change_90d: number | null;
  ai_interpretation: string | null;
  ai_score_rationale: string | null;
  data_snapshot: Record<string, unknown> | null;
  recorded_at: string;
};

export type PermitFiling = {
  id: string;
  zip_code: string;
  city: string | null;
  permit_type: string | null;
  address: string | null;
  estimated_value: number | null;
  filing_date: string | null;
  contractor_name: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
};

export type LeaseExpiration = {
  id: string;
  zip_code: string | null;
  company_name: string | null;
  ticker: string | null;
  expiration_quarter: string | null;
  sq_footage: number | null;
  address: string | null;
  source_doc: string | null;
  ai_confidence: number | null;
  created_at: string;
};

export type UserWatchlist = {
  id: string;
  user_id: string;
  zip_code: string;
  label: string | null;
  alert_threshold: number;
  created_at: string;
};

export type MarketNarrative = {
  id: string;
  zip_code: string;
  narrative: string;
  signal_context: Record<string, unknown> | null;
  generated_at: string;
};

// Signal queries
export async function getLatestSignalsByZips(zipCodes: string[]): Promise<ZipSignal[]> {
  if (zipCodes.length === 0) return [];
  const result = await sql`
    SELECT DISTINCT ON (zip_code) *
    FROM zip_signals
    WHERE zip_code = ANY(${zipCodes})
    ORDER BY zip_code, recorded_at DESC
  `;
  return result as ZipSignal[];
}

export async function getSignalHistoryForZip(zip: string, days = 90): Promise<ZipSignal[]> {
  const result = await sql`
    SELECT * FROM zip_signals
    WHERE zip_code = ${zip}
      AND recorded_at >= NOW() - INTERVAL '1 day' * ${days}
    ORDER BY recorded_at ASC
  `;
  return result as ZipSignal[];
}

export async function getTopSignalZips(limit = 20): Promise<ZipSignal[]> {
  const result = await sql`
    SELECT DISTINCT ON (zip_code) *
    FROM zip_signals
    ORDER BY zip_code, recorded_at DESC, signal_score DESC
    LIMIT ${limit}
  `;
  return result as ZipSignal[];
}

export async function upsertZipSignal(signal: Omit<ZipSignal, 'id' | 'recorded_at'>): Promise<void> {
  await sql`
    INSERT INTO zip_signals (
      zip_code, signal_type, signal_score,
      permit_volume_score, permit_value_score, permit_type_score, permit_momentum_score,
      vacancy_level_score, vacancy_direction_score, vacancy_duration_score,
      lease_density_score, lease_sqft_score, lease_timing_score,
      ai_confidence_score, data_completeness,
      raw_value, pct_change_30d, pct_change_90d,
      ai_interpretation, ai_score_rationale, data_snapshot
    ) VALUES (
      ${signal.zip_code}, ${signal.signal_type}, ${signal.signal_score},
      ${signal.permit_volume_score}, ${signal.permit_value_score}, ${signal.permit_type_score}, ${signal.permit_momentum_score},
      ${signal.vacancy_level_score}, ${signal.vacancy_direction_score}, ${signal.vacancy_duration_score},
      ${signal.lease_density_score}, ${signal.lease_sqft_score}, ${signal.lease_timing_score},
      ${signal.ai_confidence_score}, ${signal.data_completeness},
      ${signal.raw_value}, ${signal.pct_change_30d}, ${signal.pct_change_90d},
      ${signal.ai_interpretation}, ${signal.ai_score_rationale}, ${JSON.stringify(signal.data_snapshot)}
    )
    ON CONFLICT (zip_code, signal_type, DATE(recorded_at))
    DO UPDATE SET
      signal_score = EXCLUDED.signal_score,
      permit_volume_score = EXCLUDED.permit_volume_score,
      permit_value_score = EXCLUDED.permit_value_score,
      permit_type_score = EXCLUDED.permit_type_score,
      permit_momentum_score = EXCLUDED.permit_momentum_score,
      vacancy_level_score = EXCLUDED.vacancy_level_score,
      vacancy_direction_score = EXCLUDED.vacancy_direction_score,
      vacancy_duration_score = EXCLUDED.vacancy_duration_score,
      lease_density_score = EXCLUDED.lease_density_score,
      lease_sqft_score = EXCLUDED.lease_sqft_score,
      lease_timing_score = EXCLUDED.lease_timing_score,
      ai_confidence_score = EXCLUDED.ai_confidence_score,
      data_completeness = EXCLUDED.data_completeness,
      ai_interpretation = EXCLUDED.ai_interpretation,
      ai_score_rationale = EXCLUDED.ai_score_rationale,
      data_snapshot = EXCLUDED.data_snapshot
  `;
}

// Permit queries
export async function getPermitsByZip(zip: string, limit = 50): Promise<PermitFiling[]> {
  const result = await sql`
    SELECT * FROM permit_filings
    WHERE zip_code = ${zip}
    ORDER BY filing_date DESC
    LIMIT ${limit}
  `;
  return result as PermitFiling[];
}

export async function insertPermitFiling(permit: Omit<PermitFiling, 'id' | 'created_at'>): Promise<void> {
  await sql`
    INSERT INTO permit_filings (zip_code, city, permit_type, address, estimated_value, filing_date, contractor_name, raw_data)
    VALUES (${permit.zip_code}, ${permit.city}, ${permit.permit_type}, ${permit.address}, ${permit.estimated_value}, ${permit.filing_date}, ${permit.contractor_name}, ${JSON.stringify(permit.raw_data)})
    ON CONFLICT DO NOTHING
  `;
}

// Lease queries
export async function getLeasesByZip(zip: string): Promise<LeaseExpiration[]> {
  const result = await sql`
    SELECT * FROM lease_expirations
    WHERE zip_code = ${zip}
    ORDER BY created_at DESC
  `;
  return result as LeaseExpiration[];
}

export async function getAllUpcomingLeases(): Promise<LeaseExpiration[]> {
  const result = await sql`
    SELECT * FROM lease_expirations
    ORDER BY expiration_quarter ASC, sq_footage DESC NULLS LAST
  `;
  return result as LeaseExpiration[];
}

// Watchlist queries
export async function getUserWatchlist(userId: string): Promise<UserWatchlist[]> {
  const result = await sql`
    SELECT * FROM user_watchlists
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return result as UserWatchlist[];
}

export async function addToWatchlist(userId: string, zipCode: string, label?: string): Promise<void> {
  await sql`
    INSERT INTO user_watchlists (user_id, zip_code, label)
    VALUES (${userId}, ${zipCode}, ${label ?? null})
    ON CONFLICT (user_id, zip_code) DO NOTHING
  `;
}

export async function removeFromWatchlist(userId: string, zipCode: string): Promise<void> {
  await sql`
    DELETE FROM user_watchlists
    WHERE user_id = ${userId} AND zip_code = ${zipCode}
  `;
}

// Narrative queries
export async function getLatestNarrative(zip: string): Promise<MarketNarrative | null> {
  const result = await sql`
    SELECT * FROM ai_market_narratives
    WHERE zip_code = ${zip}
      AND generated_at >= NOW() - INTERVAL '24 hours'
    ORDER BY generated_at DESC
    LIMIT 1
  `;
  return (result[0] as MarketNarrative) ?? null;
}

export async function insertNarrative(zip: string, narrative: string, context: unknown): Promise<void> {
  await sql`
    INSERT INTO ai_market_narratives (zip_code, narrative, signal_context)
    VALUES (${zip}, ${narrative}, ${JSON.stringify(context)})
  `;
}
