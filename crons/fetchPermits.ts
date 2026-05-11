// Run daily: fetch permits for all watched zip codes and store in DB
import { getDb } from '../lib/db/client';
import { fetchPermitsForZip } from '../lib/data/permits';
import { insertPermitFiling } from '../lib/db/queries';

async function getWatchedZips(): Promise<string[]> {
  const db = getDb();
  const result = await db`SELECT DISTINCT zip_code FROM user_watchlists`;
  return result.map(r => r.zip_code as string);
}

export async function run() {
  const zips = await getWatchedZips();
  console.log(`Fetching permits for ${zips.length} zip codes...`);

  for (const zip of zips) {
    try {
      const permits = await fetchPermitsForZip(zip, 7); // last 7 days for daily run
      for (const permit of permits) {
        await insertPermitFiling({
          zip_code: permit.zip_code,
          city: permit.city,
          permit_type: permit.permit_type,
          address: permit.address,
          estimated_value: permit.estimated_value,
          filing_date: permit.filing_date,
          contractor_name: permit.contractor_name,
          raw_data: permit.raw,
        });
      }
      console.log(`${zip}: ${permits.length} permits ingested`);
    } catch (err) {
      console.error(`Error fetching permits for ${zip}:`, err);
    }
  }
}

if (require.main === module) {
  run().catch(console.error);
}
