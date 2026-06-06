/**
 * src/lib/ai.ts
 *
 * Client-side utility for calling the /api/recommend Pages Function.
 * Falls back gracefully if the endpoint is unreachable (e.g. local dev
 * without wrangler, or the AI binding is not yet configured).
 */

import type { QuizAnswers } from './types';

export interface AiRecommendation {
  title: string;
  year: number;
  type: 'movie' | 'series';
  matchPct: number;
  desc: string;
  reasons: string[];
}

export type AiStatus = 'idle' | 'loading' | 'success' | 'fallback';

/**
 * Calls /api/recommend and returns the parsed recommendations.
 * Throws on network failure or API error so the caller can fall back
 * to the local RecommendationEngine.
 */
export async function fetchAiRecommendations(
  quizAnswers: QuizAnswers,
  ratings: Record<number, number>
): Promise<AiRecommendation[]> {
  const response = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quizAnswers, ratings }),
    // Abort after 12 s to avoid blocking the UI indefinitely
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error((err as { error?: string }).error ?? `HTTP ${response.status}`);
  }

  const data = (await response.json()) as { recommendations?: AiRecommendation[] };

  if (!Array.isArray(data.recommendations) || data.recommendations.length === 0) {
    throw new Error('Empty recommendations array from AI endpoint.');
  }

  return data.recommendations;
}
