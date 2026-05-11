import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getUserWatchlist, getLatestSignalsByZips, getTopSignalZips } from '@/lib/db/queries';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const watchlist = await getUserWatchlist(userId);
  const zipCodes = watchlist.map(w => w.zip_code);

  let signals;
  if (zipCodes.length > 0) {
    signals = await getLatestSignalsByZips(zipCodes);
  } else {
    // Show top signals for new users with empty watchlist
    signals = await getTopSignalZips(10);
  }

  // Sort by signal score descending
  signals.sort((a, b) => b.signal_score - a.signal_score);

  return NextResponse.json({ signals, watchlist });
}
