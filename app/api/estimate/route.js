import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are a renovation cost estimator for a premium home remodeling company in Tampa/Orlando, Florida. Based on the homeowner's selections, provide a realistic ballpark cost range for their renovation project. Factor in the room type, size, scope of renovation, selected features, and Florida market pricing for 2026. Provide a low and high estimate range. Be realistic but position for a premium company that does custom work, not budget contractors. Also calculate a monthly financing amount based on the midpoint of the range at 0% interest over 24 months. Return your response as JSON with these fields: lowEstimate (number), highEstimate (number), monthlyPayment (number), summary (string, 2-3 sentences explaining what drives the cost at this scope), timeline (string, estimated project duration like '4-6 weeks'), nextStep (string, a short encouraging line about booking a free in-home consultation). Return ONLY valid JSON — no markdown code fences, no preamble, no commentary.`;

function buildUserMessage(answers) {
  const features = Array.isArray(answers.features) && answers.features.length
    ? answers.features.join(', ')
    : 'None specified';
  return [
    `Room: ${answers.room || 'Not specified'}`,
    `Size: ${answers.size || 'Not specified'}`,
    `Scope: ${answers.scope || 'Not specified'}`,
    `Features: ${features}`,
    `Timeline: ${answers.timeline || 'Not specified'}`,
    `Location: ${answers.location || 'Not specified'}`,
    '',
    'Return the JSON estimate now.',
  ].join('\n');
}

function extractJson(text) {
  if (!text) return null;
  // Strip code fences if present
  const cleaned = text
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Last-ditch: find the first { ... } block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (_e) {
        return null;
      }
    }
    return null;
  }
}

export async function POST(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'Server is missing ANTHROPIC_API_KEY. Add it to .env.local.' },
        { status: 500 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserMessage(body) }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const data = extractJson(textBlock?.text);

    if (
      !data ||
      typeof data.lowEstimate !== 'number' ||
      typeof data.highEstimate !== 'number' ||
      typeof data.monthlyPayment !== 'number'
    ) {
      return Response.json(
        { error: 'The estimator returned an unexpected response. Please try again.' },
        { status: 502 },
      );
    }

    return Response.json(data);
  } catch (err) {
    console.error('Estimate API error:', err);
    const message =
      err?.error?.message || err?.message || 'Failed to generate estimate.';
    return Response.json({ error: message }, { status: 500 });
  }
}
