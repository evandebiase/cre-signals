// Permit API fetchers — NYC Open Data as primary source, extensible to other cities

export type RawPermit = {
  address: string;
  permit_type: string;
  filing_date: string;
  estimated_value: number | null;
  contractor_name: string | null;
  zip_code: string;
  city: string;
  raw: Record<string, unknown>;
};

// NYC Open Data — DOB Permit Issuance
async function fetchNYCPermits(zip: string, days = 90): Promise<RawPermit[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const url = new URL('https://data.cityofnewyork.us/resource/ipu4-2q9a.json');
  url.searchParams.set('$where', `zip_code='${zip}' AND filing_date>='${since}'`);
  url.searchParams.set('$limit', '500');
  url.searchParams.set('$select', 'job_type,address,zip_code,filing_date,job_desc,owner_s_first_name,owner_s_last_name,initial_cost');

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data = await res.json();
  return data.map((r: Record<string, string>) => ({
    address: r.address ?? '',
    permit_type: normalizePermitType(r.job_type ?? ''),
    filing_date: r.filing_date?.split('T')[0] ?? '',
    estimated_value: r.initial_cost ? parseFloat(r.initial_cost) : null,
    contractor_name: r.owner_s_first_name
      ? `${r.owner_s_first_name} ${r.owner_s_last_name ?? ''}`.trim()
      : null,
    zip_code: zip,
    city: 'New York',
    raw: r,
  }));
}

// Chicago Data Portal — Building Permits
async function fetchChicagoPermits(zip: string, days = 90): Promise<RawPermit[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const url = new URL('https://data.cityofchicago.org/resource/ydr8-5enu.json');
  url.searchParams.set('$where', `zip_code='${zip}' AND issue_date>='${since}'`);
  url.searchParams.set('$limit', '500');
  url.searchParams.set('$select', 'permit_type,street_number,street_direction,street_name,zip_code,issue_date,estimated_cost,contractor_last_name,contractor_first_name');

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data = await res.json();
  return data.map((r: Record<string, string>) => ({
    address: `${r.street_number ?? ''} ${r.street_direction ?? ''} ${r.street_name ?? ''}`.trim(),
    permit_type: normalizePermitType(r.permit_type ?? ''),
    filing_date: r.issue_date?.split('T')[0] ?? '',
    estimated_value: r.estimated_cost ? parseFloat(r.estimated_cost) : null,
    contractor_name: r.contractor_last_name
      ? `${r.contractor_first_name ?? ''} ${r.contractor_last_name}`.trim()
      : null,
    zip_code: zip,
    city: 'Chicago',
    raw: r,
  }));
}

// LA County
async function fetchLAPermits(zip: string, days = 90): Promise<RawPermit[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const url = new URL('https://data.lacity.org/resource/nbyu-2ha9.json');
  url.searchParams.set('$where', `zip='${zip}' AND issue_date>='${since}'`);
  url.searchParams.set('$limit', '500');

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data = await res.json();
  return data.map((r: Record<string, string>) => ({
    address: r.address ?? '',
    permit_type: normalizePermitType(r.permit_type ?? ''),
    filing_date: r.issue_date?.split('T')[0] ?? '',
    estimated_value: r.valuation ? parseFloat(r.valuation) : null,
    contractor_name: r.contractor_name ?? null,
    zip_code: zip,
    city: 'Los Angeles',
    raw: r,
  }));
}

function normalizePermitType(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('tenant') || lower.includes('interior') || lower.includes('alteration') || lower.includes('ti')) {
    return 'tenant_improvement';
  }
  if (lower.includes('new') || lower.includes('construct') || lower.includes('erect')) {
    return 'new_construction';
  }
  if (lower.includes('demo') || lower.includes('wreck')) {
    return 'demolition';
  }
  return 'other';
}

// Detect city from zip (simplified — real impl would use a zip→city lookup table)
function detectCityFromZip(zip: string): string {
  const prefix = parseInt(zip.substring(0, 3));
  if (prefix >= 100 && prefix <= 119) return 'nyc';
  if (prefix >= 606 && prefix <= 608) return 'chicago';
  if (prefix >= 900 && prefix <= 919) return 'la';
  return 'unknown';
}

export async function fetchPermitsForZip(zip: string, days = 90): Promise<RawPermit[]> {
  const city = detectCityFromZip(zip);
  try {
    switch (city) {
      case 'nyc': return await fetchNYCPermits(zip, days);
      case 'chicago': return await fetchChicagoPermits(zip, days);
      case 'la': return await fetchLAPermits(zip, days);
      default: return [];
    }
  } catch {
    return [];
  }
}

export function computePermitStats(permits: RawPermit[]) {
  const total = permits.length;
  const totalValue = permits.reduce((s, p) => s + (p.estimated_value ?? 0), 0);

  const typeCounts: Record<string, number> = {};
  for (const p of permits) {
    typeCounts[p.permit_type] = (typeCounts[p.permit_type] ?? 0) + 1;
  }

  const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown';

  // MoM velocity (last 30d vs prior 30d)
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

  const last30 = permits.filter(p => new Date(p.filing_date).getTime() >= thirtyDaysAgo).length;
  const prior30 = permits.filter(p => {
    const t = new Date(p.filing_date).getTime();
    return t >= sixtyDaysAgo && t < thirtyDaysAgo;
  }).length;

  const momChange = prior30 > 0 ? ((last30 - prior30) / prior30) * 100 : 0;

  return {
    total,
    totalValue,
    dominantType,
    typeCounts,
    last30,
    prior30,
    momChange,
  };
}
