import { anthropic, MODEL } from './claude';

export type SignalInputData = {
  zip: string;
  // Permit inputs
  permitCount: number;
  permitBaseline: number;
  permitTotalValue: number;
  permitValueMedian: number;
  dominantType: string;
  permitTypeBreakdown: string;
  permitMomChanges: string;
  // Vacancy inputs
  vacancyRate: number;
  vacancyChange: number;
  avgVacancyDays: number;
  // Lease inputs
  leaseCount: number;
  zipAreaSqMiles: number;
  leaseSqft: number;
  nearestExpirationDays: number;
  medianExpirationDays: number;
  // Meta
  dataCompleteness: number;
};

export type SignalInterpretation = {
  signal_score: number;
  permit_volume_score: number;
  permit_value_score: number;
  permit_type_score: number;
  permit_momentum_score: number;
  vacancy_level_score: number;
  vacancy_direction_score: number;
  vacancy_duration_score: number;
  lease_density_score: number;
  lease_sqft_score: number;
  lease_timing_score: number;
  ai_confidence_score: number;
  signal_type: 'bullish' | 'bearish' | 'neutral';
  interpretation: string;
  score_rationale: string;
};

export async function interpretSignal(data: SignalInputData): Promise<SignalInterpretation> {
  const prompt = `You are a commercial real estate analyst scoring market signals for zip code ${data.zip}.
Score each sub-dimension from 0–100 using the criteria below, then compute the composite. Be precise — use the full range. A score of 50 is genuinely average for that zip's metro peer group. Do not cluster scores near 50 out of caution.

--- PERMIT VELOCITY ---
permit_volume_score (0–100):
  0–20   = filing count is >40% below this zip's 3-year baseline
  21–40  = 20–40% below baseline
  41–60  = within ±20% of baseline (average activity)
  61–80  = 20–50% above baseline (elevated)
  81–100 = >50% above baseline (exceptional surge)
  Raw input: ${data.permitCount} filings in 90d vs baseline of ${data.permitBaseline}

permit_value_score (0–100):
  Score based on total estimated permit dollar value vs zip median.
  High-value TI and new construction permits score higher than low-value cosmetic work.
  Raw input: $${data.permitTotalValue} total vs zip median of $${data.permitValueMedian}

permit_type_score (0–100):
  100 = all tenant improvement (strongest leasing signal)
  70  = mixed TI + new construction
  40  = new construction only (supply-side, not leasing signal)
  10  = demolition-heavy (negative signal)
  Raw input: dominant type = ${data.dominantType}, breakdown = ${data.permitTypeBreakdown}

permit_momentum_score (0–100):
  Measures acceleration, not level. Is filing velocity increasing?
  0   = declining >20% month-over-month for 3+ months
  50  = flat (±5% MoM)
  100 = accelerating >15% MoM for 2+ consecutive months
  Raw input: MoM changes = ${data.permitMomChanges}

--- VACANCY ---
vacancy_level_score (0–100):
  Score is INVERTED — lower vacancy = higher score.
  0–20   = vacancy >15% (severely distressed)
  21–40  = vacancy 10–15%
  41–60  = vacancy 7–10% (market average)
  61–80  = vacancy 4–7% (healthy, tight)
  81–100 = vacancy <4% (very tight, pricing power)
  Raw input: current vacancy proxy = ${data.vacancyRate}%

vacancy_direction_score (0–100):
  0   = vacancy rising >2pp over 90d
  25  = vacancy rising slightly (0–2pp)
  50  = flat
  75  = vacancy falling slightly (0–2pp)
  100 = vacancy falling rapidly (>2pp over 90d)
  Raw input: 90d change = ${data.vacancyChange}pp

vacancy_duration_score (0–100):
  80–100 = most vacancies < 90 days (fresh, likely transitional)
  50–79  = 90–180 days average duration
  20–49  = 180–365 days (becoming structural)
  0–19   = >1 year average (structural vacancy problem)
  Raw input: avg vacancy duration = ${data.avgVacancyDays} days

--- LEASE CLUSTER ---
lease_density_score (0–100):
  0–20   = 0–1 expirations detected
  21–50  = 2–5 expirations (light cluster)
  51–75  = 6–15 expirations (meaningful cluster)
  76–100 = 16+ expirations (dense cluster, high opportunity)
  Raw input: ${data.leaseCount} expirations detected, zip area = ${data.zipAreaSqMiles} sq miles

lease_sqft_score (0–100):
  0–20   = <10,000 sqft total
  21–50  = 10,000–50,000 sqft
  51–75  = 50,000–200,000 sqft
  76–100 = >200,000 sqft (major opportunity)
  Raw input: ${data.leaseSqft} total sqft expiring

lease_timing_score (0–100):
  0–30   = all expirations >18 months out
  31–60  = 12–18 months out
  61–85  = 6–12 months out (prime outreach window)
  86–100 = <6 months out (urgent)
  Raw input: nearest expiration = ${data.nearestExpirationDays} days, median = ${data.medianExpirationDays} days

--- COMPOSITE SCORING FORMULA ---
Compute as:
  permit_composite = (permit_volume_score * 0.35) + (permit_value_score * 0.25) + (permit_type_score * 0.25) + (permit_momentum_score * 0.15)
  vacancy_composite = (vacancy_level_score * 0.40) + (vacancy_direction_score * 0.35) + (vacancy_duration_score * 0.25)
  lease_composite = (lease_density_score * 0.35) + (lease_sqft_score * 0.35) + (lease_timing_score * 0.30)
  signal_score = round(permit_composite * 0.40 + vacancy_composite * 0.40 + lease_composite * 0.20)

ai_confidence_score (0–100):
  How confident are you in this scoring given data completeness and consistency?
  Deduct points for: missing data sources, conflicting signals, unusually thin permit history.
  Raw input: data_completeness = ${data.dataCompleteness}

Respond ONLY in JSON matching this exact shape:
{
  "signal_score": 0,
  "permit_volume_score": 0,
  "permit_value_score": 0,
  "permit_type_score": 0,
  "permit_momentum_score": 0,
  "vacancy_level_score": 0,
  "vacancy_direction_score": 0,
  "vacancy_duration_score": 0,
  "lease_density_score": 0,
  "lease_sqft_score": 0,
  "lease_timing_score": 0,
  "ai_confidence_score": 0,
  "signal_type": "bullish|bearish|neutral",
  "interpretation": "One sentence, data-specific, no hedging.",
  "score_rationale": "2–3 sentences explaining the most decisive factors in this score."
}`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in AI response');

  return JSON.parse(jsonMatch[0]) as SignalInterpretation;
}
