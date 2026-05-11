import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateMarketNarrative } from '@/lib/ai/generateNarrative';
import { getSignalHistoryForZip } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { zip } = await req.json();
  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Invalid zip code' }, { status: 400 });
  }

  try {
    const signals = await getSignalHistoryForZip(zip, 90);
    const narrative = await generateMarketNarrative(zip, { signals });
    return NextResponse.json({ narrative });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[narrative] error:', message);
    const isKeyError = message.includes('ANTHROPIC_API_KEY') || message.includes('authentication') || message.includes('401');
    return NextResponse.json(
      { error: isKeyError ? 'AI service not configured' : 'Failed to generate narrative', detail: message },
      { status: 500 }
    );
  }
}
