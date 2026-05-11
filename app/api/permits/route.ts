import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getPermitsByZip } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const zip = req.nextUrl.searchParams.get('zip');
  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Invalid zip code' }, { status: 400 });
  }

  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50');
  const permits = await getPermitsByZip(zip, Math.min(limit, 200));

  return NextResponse.json({ permits });
}
