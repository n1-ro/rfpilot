import { NextResponse } from 'next/server';
import { parseRfp } from '@/lib/engine/parse-rfp';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const rawText: string | undefined = body?.rfpText;

  if (!rawText || typeof rawText !== 'string') {
    return NextResponse.json({ error: 'rfpText is required' }, { status: 400 });
  }

  const parsed = parseRfp(rawText);
  return NextResponse.json(parsed);
}
