import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getAllUpcomingLeases, getLeasesByZip } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const zip = req.nextUrl.searchParams.get('zip');
  if (zip) {
    const leases = await getLeasesByZip(zip);
    return NextResponse.json({ leases });
  }

  const leases = await getAllUpcomingLeases();
  return NextResponse.json({ leases });
}
