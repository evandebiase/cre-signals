import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { addToWatchlist, removeFromWatchlist } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { zip, label } = await req.json();
  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Invalid zip code' }, { status: 400 });
  }

  await addToWatchlist(userId, zip, label);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const zip = req.nextUrl.searchParams.get('zip');
  if (!zip) return NextResponse.json({ error: 'zip required' }, { status: 400 });

  await removeFromWatchlist(userId, zip);
  return NextResponse.json({ success: true });
}
