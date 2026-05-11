// SEC EDGAR full-text search for lease expirations in 10-K filings

const EDGAR_API = 'https://data.sec.gov';

export type EdgarLeaseMatch = {
  company_name: string;
  ticker: string | null;
  cik: string;
  filed_at: string;
  filing_url: string;
  raw_excerpt: string;
  expiration_quarter: string | null;
  zip_code: string | null;
  sq_footage: number | null;
  ai_confidence: number;
};

// Search EDGAR full-text for lease expiration disclosures
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function searchLeaseExpirations(_query?: string): Promise<EdgarLeaseMatch[]> {
  try {
    const url = new URL('https://efts.sec.gov/LATEST/search-index?q=%22lease+expires%22&dateRange=custom&startdt=2024-01-01&enddt=2025-12-31&forms=10-K');

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'CRE Data Platform contact@credata.co' },
    });
    if (!res.ok) return [];

    const data = await res.json();
    const hits = data.hits?.hits ?? [];

    return hits.slice(0, 20).map((hit: Record<string, unknown>) => {
      const src = hit._source as Record<string, unknown>;
      return {
        company_name: (src.entity_name as string) ?? 'Unknown',
        ticker: (src.ticker as string) ?? null,
        cik: (src.entity_id as string) ?? '',
        filed_at: (src.file_date as string) ?? '',
        filing_url: `https://www.sec.gov/Archives/edgar/data/${src.entity_id}/`,
        raw_excerpt: (src.description as string) ?? '',
        expiration_quarter: null,
        zip_code: null,
        sq_footage: null,
        ai_confidence: 0.5,
      };
    });
  } catch {
    return [];
  }
}

// Fetch recent 10-K filings for a specific company
export async function fetchCompany10K(cik: string): Promise<string | null> {
  try {
    const paddedCik = cik.padStart(10, '0');
    const url = `${EDGAR_API}/submissions/CIK${paddedCik}.json`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'CRE Data Platform contact@credata.co' },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const filings = data.filings?.recent;
    if (!filings) return null;

    // Find most recent 10-K
    const idx = filings.form?.findIndex((f: string) => f === '10-K');
    if (idx === -1 || idx === undefined) return null;

    const accession = filings.accessionNumber?.[idx]?.replace(/-/g, '');
    const primaryDoc = filings.primaryDocument?.[idx];

    return `https://www.sec.gov/Archives/edgar/data/${cik}/${accession}/${primaryDoc}`;
  } catch {
    return null;
  }
}
