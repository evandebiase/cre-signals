// US Census Bureau API client — vacancy proxies via ACS

const BASE = 'https://api.census.gov/data';
const KEY = process.env.CENSUS_API_KEY ?? '';

export type VacancyData = {
  zip_code: string;
  vacancy_rate: number; // percentage 0-100
  total_units: number;
  vacant_units: number;
  year: number;
};

// ACS 5-year estimates — B25002 (occupancy status) and B25004 (vacancy status)
export async function fetchVacancyByZip(zip: string): Promise<VacancyData | null> {
  try {
    // B25001: Total housing units, B25002: Occupancy, B25003: Tenure
    const url = new URL(`${BASE}/2022/acs/acs5`);
    url.searchParams.set('get', 'B25001_001E,B25002_001E,B25002_003E');
    url.searchParams.set('for', `zip code tabulation area:${zip}`);
    if (KEY) url.searchParams.set('key', KEY);

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = await res.json();
    if (!data || data.length < 2) return null;

    const [, row] = data; // skip header
    const totalUnits = parseInt(row[0]) || 0;
    const totalOccupancy = parseInt(row[1]) || 0;
    const vacantUnits = parseInt(row[2]) || 0;

    if (totalOccupancy === 0) return null;

    return {
      zip_code: zip,
      total_units: totalUnits,
      vacant_units: vacantUnits,
      vacancy_rate: (vacantUnits / Math.max(totalOccupancy, 1)) * 100,
      year: 2022,
    };
  } catch {
    return null;
  }
}

export type EmploymentData = {
  zip_code: string;
  employed: number;
  unemployed: number;
  unemployment_rate: number;
  year: number;
};

export async function fetchEmploymentByZip(zip: string): Promise<EmploymentData | null> {
  try {
    const url = new URL(`${BASE}/2022/acs/acs5`);
    url.searchParams.set('get', 'B23025_003E,B23025_005E');
    url.searchParams.set('for', `zip code tabulation area:${zip}`);
    if (KEY) url.searchParams.set('key', KEY);

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = await res.json();
    if (!data || data.length < 2) return null;

    const [, row] = data;
    const employed = parseInt(row[0]) || 0;
    const unemployed = parseInt(row[1]) || 0;
    const laborForce = employed + unemployed;

    return {
      zip_code: zip,
      employed,
      unemployed,
      unemployment_rate: laborForce > 0 ? (unemployed / laborForce) * 100 : 0,
      year: 2022,
    };
  } catch {
    return null;
  }
}
