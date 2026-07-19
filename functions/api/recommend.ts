/**
 * Cloudflare Pages Function: /api/recommend
 *
 * OPTIONAL enhancement layer. The client-side engine (src/lib/engine.ts +
 * src/lib/tmdb.ts) is fully self-sufficient and works with this endpoint
 * absent entirely. This exists only for deployments that want an extra
 * AI-generated re-ranking pass on top of the live TMDB pool.
 *
 * Requires the Workers AI binding to be enabled for the Pages project in
 * the Cloudflare dashboard (Settings → Functions → AI binding), not just
 * declared in wrangler.jsonc — a mismatch here is the most common reason
 * this endpoint silently 503s.
 */

interface Env {
  AI: {
    run(
      model: string,
      options: {
        messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
        temperature?: number;
        max_tokens?: number;
      }
    ): Promise<{ response: string }>;
  };
}

interface CandidateSummary {
  id: number;
  title: string;
  year: number;
  genres: string[];
  vibe: string[];
}

interface RequestBody {
  preferencesSummary: string;
  candidates: CandidateSummary[];
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const MAX_CANDIDATES = 40;

export const onRequestPost: (ctx: { request: Request; env: Env }) => Promise<Response> = async ({
  request,
  env,
}) => {
  if (!env.AI) {
    return Response.json(
      { error: 'AI binding not configured for this deployment.' },
      { status: 503, headers: CORS }
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400, headers: CORS });
  }

  const candidates = (body.candidates ?? []).slice(0, MAX_CANDIDATES);
  if (candidates.length === 0) {
    return Response.json({ error: 'No candidates provided.' }, { status: 400, headers: CORS });
  }

  const candidateList = candidates
    .map((c) => `- id:${c.id} "${c.title}" (${c.year}) [${[...c.genres, ...c.vibe].join(', ')}]`)
    .join('\n');

  const systemPrompt = `You re-rank a pre-filtered candidate list for CineMatch. You never invent titles — you only reorder and briefly explain the ids given. Output ONLY raw JSON, no markdown:
{ "ranking": [ { "id": number, "reason": string } ] }
"reason" must be a single specific sentence under 18 words, referencing the user's stated preferences. Include every id from the candidate list exactly once.`;

  const userPrompt = `User preferences: ${body.preferencesSummary || 'none stated'}

Candidates:
${candidateList}

Return the ranking, best match first.`;

  let rawResponse: string;
  try {
    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 900,
    });
    rawResponse = result.response?.trim() ?? '';
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown AI error';
    return Response.json({ error: `Workers AI call failed: ${msg}` }, { status: 502, headers: CORS });
  }

  const cleaned = rawResponse
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  let parsed: { ranking?: { id: number; reason: string }[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return Response.json(
      { error: 'AI returned malformed JSON.', raw: cleaned },
      { status: 422, headers: CORS }
    );
  }

  const validIds = new Set(candidates.map((c) => c.id));
  const ranking = (parsed.ranking ?? []).filter((r) => validIds.has(r.id));

  return Response.json({ ranking }, { headers: CORS });
};

export const onRequestOptions: () => Response = () => new Response(null, { status: 204, headers: CORS });
