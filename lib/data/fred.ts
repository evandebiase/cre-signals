// Federal Reserve FRED API client

const FRED_BASE = 'https://api.stlouisfed.org/fred';
const KEY = process.env.FRED_API_KEY ?? '';

export type FREDObservation = {
  date: string;
  value: number | null;
};

export type FREDSeries = {
  series_id: string;
  observations: FREDObservation[];
};

async function fetchSeries(seriesId: string, limit = 12): Promise<FREDSeries | null> {
  try {
    const url = new URL(`${FRED_BASE}/series/observations`);
    url.searchParams.set('series_id', seriesId);
    url.searchParams.set('api_key', KEY);
    url.searchParams.set('file_type', 'json');
    url.searchParams.set('sort_order', 'desc');
    url.searchParams.set('limit', String(limit));

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = await res.json();
    const observations: FREDObservation[] = (data.observations ?? []).map(
      (o: { date: string; value: string }) => ({
        date: o.date,
        value: o.value === '.' ? null : parseFloat(o.value),
      })
    );

    return { series_id: seriesId, observations };
  } catch {
    return null;
  }
}

// National office vacancy rate (FRED: CUUR0000SEHA is CPI housing — use COMVACUSQ176N for commercial vacancy)
export async function fetchNationalCommercialVacancy(): Promise<FREDSeries | null> {
  return fetchSeries('COMVACUSQ176N');
}

// 10-year Treasury yield (proxy for cap rate floor)
export async function fetchTreasuryYield(): Promise<FREDSeries | null> {
  return fetchSeries('DGS10');
}

// Commercial Real Estate Price Index
export async function fetchCREPriceIndex(): Promise<FREDSeries | null> {
  return fetchSeries('COMREPUSQ159N');
}

// Mortgage Bankers Association — commercial mortgage delinquency
export async function fetchCREDelinquency(): Promise<FREDSeries | null> {
  return fetchSeries('DRCRELEXFACBS');
}

export type MacroContext = {
  national_vacancy_rate: number | null;
  treasury_10y: number | null;
  cre_price_index: number | null;
  delinquency_rate: number | null;
  as_of: string;
};

export async function fetchMacroContext(): Promise<MacroContext> {
  const [vacancy, treasury, cre, delinquency] = await Promise.all([
    fetchNationalCommercialVacancy(),
    fetchTreasuryYield(),
    fetchCREPriceIndex(),
    fetchCREDelinquency(),
  ]);

  return {
    national_vacancy_rate: vacancy?.observations[0]?.value ?? null,
    treasury_10y: treasury?.observations[0]?.value ?? null,
    cre_price_index: cre?.observations[0]?.value ?? null,
    delinquency_rate: delinquency?.observations[0]?.value ?? null,
    as_of: new Date().toISOString(),
  };
}
