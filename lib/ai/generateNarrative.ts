import { getAnthropic, MODEL } from './claude';
import { getLatestNarrative, insertNarrative } from '../db/queries';

export async function generateMarketNarrative(
  zip: string,
  signalData: Record<string, unknown>
): Promise<string> {
  const cached = await getLatestNarrative(zip);
  if (cached) return cached.narrative;

  const prompt = `You are a senior CRE market analyst writing for brokers, developers, and lenders.
Write a 3-paragraph market narrative for zip code ${zip} based on:
${JSON.stringify(signalData, null, 2)}

Paragraph 1: What the data shows (factual)
Paragraph 2: What it likely means for the market (analytical)
Paragraph 3: Who should be paying attention and why (actionable)

Tone: Professional, direct, data-driven. No fluff.`;

  const message = await getAnthropic().messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const narrative = message.content[0].type === 'text' ? message.content[0].text : '';

  // Best-effort cache — don't let DB failure kill the response
  try {
    await insertNarrative(zip, narrative, signalData);
  } catch (e) {
    console.error('insertNarrative failed:', e);
  }

  return narrative;
}
