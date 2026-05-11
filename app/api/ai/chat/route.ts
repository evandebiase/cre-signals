import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { getAnthropic, MODEL } from '@/lib/ai/claude';
import { getUserWatchlist, getLatestSignalsByZips } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { messages } = await req.json();

  const watchlist = await getUserWatchlist(userId);
  const zipCodes = watchlist.map(w => w.zip_code);
  const signals = zipCodes.length > 0 ? await getLatestSignalsByZips(zipCodes) : [];

  const systemPrompt = `You are CRE Data AI, an expert commercial real estate analyst.
You have access to live market data for the user's watched zip codes.
Current data context:
${JSON.stringify({ watchlist, signals }, null, 2)}

Answer questions with specific data citations. When recommending zips, explain the signal combination that makes them interesting.
Be direct and quantitative — this user pays for precision, not opinions.
Signal scores range from 0–100. Score bands: 0–29=Quiet, 30–49=Low, 50–64=Moderate, 65–79=Elevated, 80–100=High.`;

  const stream = await getAnthropic().messages.stream({
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
