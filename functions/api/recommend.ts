/**
 * Cloudflare Pages Function: /api/recommend
 *
 * Receives quiz answers + rating history, builds a structured prompt,
 * runs it through Llama 3.1 8B via Workers AI, and returns a clean JSON
 * array of recommendations.
 *
 * Binding required in wrangler.jsonc:
 *   { "ai": { "binding": "AI" } }
 */

import { RATING_POOL } from '../../src/lib/data';
import type { QuizAnswers } from '../../src/lib/types';

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

export interface AiRecommendation {
  title: string;
  year: number;
  type: 'movie' | 'series';
  matchPct: number;
  desc: string;
  reasons: string[];
}

interface RequestBody {
  quizAnswers: QuizAnswers;
  ratings: Record<number, number>;
}

// ── Payload builder ────────────────────────────────────────────────────────
function buildPromptSections(quizAnswers: QuizAnswers, ratings: Record<number, number>) {
  const prefs: string[] = [];

  if (quizAnswers.mood)
    prefs.push(`Genre / Mood: ${quizAnswers.mood}`);
  if (quizAnswers.vibe)
    prefs.push(`Atmosphere: ${quizAnswers.vibe}`);
  if (quizAnswers.era && quizAnswers.era !== 'any')
    prefs.push(`Era preference: ${quizAnswers.era === 'classic' ? 'pre-2000' : quizAnswers.era === 'mid' ? '2000–2015' : '2016 onwards'}`);
  if (quizAnswers.format && quizAnswers.format !== 'both')
    prefs.push(`Format: ${quizAnswers.format === 'movie' ? 'Movie (standalone film)' : 'Series (TV show)'}`);
  if (quizAnswers.language)
    prefs.push(`Language: ${quizAnswers.language === 'english' ? 'English only' : quizAnswers.language === 'subtitles' ? 'Fine with subtitles' : 'No language preference'}`);
  if (quizAnswers.company)
    prefs.push(`Watching with: ${quizAnswers.company}`);

  // Resolve numeric IDs → real titles using RATING_POOL
  const STAR_LABELS = ['', "didn't like it", 'it was okay', 'liked it', 'really liked it', 'loved it'];
  const reviews = Object.entries(ratings)
    .map(([idStr, score]) => {
      const movie = RATING_POOL.find(m => m.id === Number(idStr));
      if (!movie) return '';
      return `  - ${movie.title} (${movie.year}): ${score}/5 — ${STAR_LABELS[score] ?? ''}`;
    })
    .filter(Boolean);

  return {
    preferences: prefs.length ? prefs.join('\n') : 'No specific preferences given.',
    reviews: reviews.length ? reviews.join('\n') : 'No titles rated.',
  };
}

// ── CORS headers ───────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Worker entry point ─────────────────────────────────────────────────────
export const onRequestPost: (ctx: { request: Request; env: Env }) => Promise<Response> =
  async ({ request, env }) => {
    // Validate AI binding exists
    if (!env.AI) {
      return Response.json(
        { error: 'AI binding not configured. Add "ai" binding in wrangler.jsonc.' },
        { status: 503, headers: CORS }
      );
    }

    let body: RequestBody;
    try {
      body = (await request.json()) as RequestBody;
    } catch {
      return Response.json({ error: 'Invalid JSON body.' }, { status: 400, headers: CORS });
    }

    const { quizAnswers = {}, ratings = {} } = body;
    const { preferences, reviews } = buildPromptSections(quizAnswers, ratings);

    // ── Prompts ──────────────────────────────────────────────────────────
    const systemPrompt = `You are the recommendation engine for CineMatch, a precision film and TV discovery app.
Your role is to analyse a user's quiz preferences alongside their historical ratings to surface personalised recommendations.

Rules:
- Infer latent tastes from ratings: e.g. high scores on psychological thrillers → prioritise tension and moral complexity.
- Never recommend any title the user has already rated.
- Balance explicit preferences (genre, era, language) with inferred taste signals from ratings.
- Keep descriptions concise, punchy, and spoiler-free (≤ 20 words each).
- Reasons must be specific to this user's inputs — never generic phrases like "great film".

Output ONLY a raw JSON object — no markdown, no explanation, no code fences:
{
  "recommendations": [
    {
      "title": string,
      "year": number,
      "type": "movie" | "series",
      "matchPct": number,
      "desc": string,
      "reasons": string[]
    }
  ]
}

matchPct must be a number 70–99. reasons must contain exactly 2–3 short strings.`;

    const userPrompt = `### USER PREFERENCES
${preferences}

### USER RATINGS HISTORY
${reviews}

Return exactly 5 recommendations. Order them from highest to lowest matchPct.`;

    // ── Call Workers AI ───────────────────────────────────────────────────
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

    // ── Parse & validate JSON ─────────────────────────────────────────────
    // Strip any accidental markdown fences the model might still emit
    const cleaned = rawResponse
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    let parsed: { recommendations: AiRecommendation[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Return raw text so the client can decide to fall back
      return Response.json(
        { error: 'AI returned malformed JSON.', raw: cleaned },
        { status: 422, headers: CORS }
      );
    }

    // Clamp matchPct to valid range, guarantee type field is valid
    parsed.recommendations = (parsed.recommendations ?? []).map(r => ({
      ...r,
      matchPct: Math.min(99, Math.max(1, Math.round(r.matchPct ?? 80))),
      type: r.type === 'series' ? 'series' : 'movie',
      reasons: (r.reasons ?? []).slice(0, 3),
    }));

    return Response.json(parsed, { headers: CORS });
  };

// Handle preflight CORS
export const onRequestOptions: () => Response = () =>
  new Response(null, { status: 204, headers: CORS });
