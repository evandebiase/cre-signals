// Weekly: pull SEC EDGAR 10-K filings and extract lease expirations via Claude
import { searchLeaseExpirations } from '../lib/data/edgar';
import { anthropic, MODEL } from '../lib/ai/claude';
import { getDb } from '../lib/db/client';

export async function run() {
  const matches = await searchLeaseExpirations();
  console.log(`Found ${matches.length} potential lease disclosure filings`);

  const db = getDb();

  for (const match of matches) {
    if (!match.raw_excerpt) continue;

    // Use Claude to extract structured lease data from the filing excerpt
    const prompt = `Extract lease expiration information from this SEC 10-K filing excerpt.
Company: ${match.company_name}
Excerpt: ${match.raw_excerpt.slice(0, 2000)}

Return JSON array of lease expirations found:
[{
  "expiration_quarter": "Q3 2026",
  "sq_footage": 45000,
  "address": "123 Main St, New York NY",
  "zip_code": "10001",
  "confidence": 0.85
}]

If no specific lease data is found, return [].`;

    try {
      const res = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = res.content[0].type === 'text' ? res.content[0].text : '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) continue;

      const leases = JSON.parse(jsonMatch[0]);
      for (const lease of leases) {
        await db`
          INSERT INTO lease_expirations (zip_code, company_name, ticker, expiration_quarter, sq_footage, address, source_doc, ai_confidence)
          VALUES (${lease.zip_code ?? null}, ${match.company_name}, ${match.ticker ?? null}, ${lease.expiration_quarter ?? null}, ${lease.sq_footage ?? null}, ${lease.address ?? null}, ${match.filing_url}, ${lease.confidence ?? 0.5})
          ON CONFLICT DO NOTHING
        `;
      }

      console.log(`${match.company_name}: ${leases.length} lease expirations extracted`);
    } catch (err) {
      console.error(`Error parsing ${match.company_name}:`, err);
    }

    await new Promise(r => setTimeout(r, 1000));
  }
}

if (require.main === module) {
  run().catch(console.error);
}
