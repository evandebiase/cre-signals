import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getSignalHistoryForZip, getPermitsByZip, getLeasesByZip } from '@/lib/db/queries';

export async function GET(req: NextRequest, { params }: { params: { zip: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { zip } = params;

  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Invalid zip code' }, { status: 400 });
  }

  const [signals, permits, leases] = await Promise.all([
    getSignalHistoryForZip(zip, 365),
    getPermitsByZip(zip, 50),
    getLeasesByZip(zip),
  ]);

  return NextResponse.json({ zip, signals, permits, leases });
}
