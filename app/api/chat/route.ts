import { menuByDay, type MenuItem } from './menu-data';

export const runtime = 'nodejs';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type ChatRequestBody = {
  messages?: ChatMessage[];
};

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'dai-bot';

const pricePattern = /(at or below|up to|no more than|under|below|lower than|less than|ไม่เกิน|ต่ำกว่า)\s*\$?\s*(\d+(?:\.\d+)?)/i;
const calendarDateByDay: Record<string, number> = {
  monday: 7,
  tuesday: 8,
  wednesday: 9,
  thursday: 10,
  friday: 11,
};

function createLocalStream(content: string): Response {
  return new Response(
    `${JSON.stringify({ message: { role: 'assistant', content }, done: true })}\n`,
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    }
  );
}

function formatPriceMatches(
  date: string,
  amount: number,
  inclusive: boolean,
  items: MenuItem[]
): string {
  const condition = inclusive ? `at or below $${amount}` : `under $${amount}`;

  if (items.length === 0) {
    return `No menu items ${condition} were found for ${date}. Thank you.`;
  }

  const sections = ['Hot Food', 'Cold Food (Grab and Go)']
    .map((category) => {
      const matches = items.filter((item) => item.category === category);
      if (matches.length === 0) return '';

      const lines = matches
        .map(
          (item) =>
            `- ${item.name} — $${item.price.toFixed(2)}\n  Allergens: ${item.allergens}`
        )
        .join('\n');

      return `${category}\n\n${lines}`;
    })
    .filter(Boolean)
    .join('\n\n');

  return `Menu items ${condition} for ${date}\n\n${sections}\n\nThank you.`;
}

function getPriceFilterResponse(messages: ChatMessage[]): string | null {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'user')?.content;

  if (!latestUserMessage) return null;

  const priceMatch = latestUserMessage.match(pricePattern);
  if (!priceMatch) return null;

  const day = Object.keys(menuByDay).find((name) => {
    const weekdayPattern = new RegExp(`\\b${name}\\b`, 'i');
    const date = calendarDateByDay[name];
    const datePattern = new RegExp(`\\b${date}(?:st|nd|rd|th)?\\s+(?:sep|september)\\b`, 'i');
    return weekdayPattern.test(latestUserMessage) || datePattern.test(latestUserMessage);
  });

  if (!day) {
    return 'Please specify the day or date, such as Monday or 7 September, so I can check the correct menu for you. Thank you.';
  }

  const amount = Number(priceMatch[2]);
  const inclusive = /^(at or below|up to|no more than|ไม่เกิน)$/i.test(priceMatch[1]);
  const dailyMenu = menuByDay[day];
  const matchingItems = dailyMenu.items.filter((item) =>
    inclusive ? item.price <= amount : item.price < amount
  );

  return formatPriceMatches(dailyMenu.date, amount, inclusive, matchingItems);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const priceFilterResponse = getPriceFilterResponse(messages);

    if (priceFilterResponse) {
      return createLocalStream(priceFilterResponse);
    }

    // Ollama and API
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: true,  // open streaming
        messages,
      }),
    });

    if (!ollamaResponse.ok || !ollamaResponse.body) {
      const errorText = await ollamaResponse.text();
      return Response.json(
        { error: `Ollama request failed: ${errorText}` },
        { status: 500 }
      );
    }

    // Stream response back to client
    return new Response(ollamaResponse.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
