// src/lib/llm.ts
//
// Optional local LLM used to write a single, more natural "why this pick"
// sentence per result. Runs entirely in the browser via transformers.js
// (WASM/WebGPU) — no server call, no API key, no data leaves the device.
//
// Deliberately NOT an npm dependency: @huggingface/transformers (the
// maintained successor to the old @xenova/transformers) pulls in
// onnxruntime-node and sharp as hard dependencies for its Node backend,
// which means a native-binary postinstall step (NuGet download) that has
// nothing to do with this being a 100%-browser feature, plus it drags
// transitive vulnerabilities into `npm audit` for a feature most users
// won't even enable. Instead, this loads the browser build straight from
// a CDN only when a user explicitly opts in from the results screen — so
// `npm install` stays small, fast, and clean for everyone else.
//
// This module is never imported eagerly. main.ts only reaches it if the
// user clicks "Explain picks with on-device AI" in results.ts.

import type { ScoredItem } from './types';

const CDN_URL = 'https://esm.sh/@huggingface/transformers@4.2.0';

type Pipeline = (input: string, options?: Record<string, unknown>) => Promise<{ generated_text: string }[]>;

let generator: Pipeline | null = null;
let loadingPromise: Promise<void> | null = null;

export type LlmStatus = 'unavailable' | 'loading' | 'ready' | 'error';
let status: LlmStatus = 'unavailable';

export function getLlmStatus(): LlmStatus {
  return status;
}

/** Downloads and initializes a small quantized instruction model. Idempotent. */
export async function enableLocalAi(
  onProgress?: (pct: number) => void
): Promise<void> {
  if (generator) return;
  if (loadingPromise) return loadingPromise;

  status = 'loading';
  loadingPromise = (async () => {
    try {
      const { pipeline } = await import(/* @vite-ignore */ CDN_URL);
      generator = (await pipeline('text-generation', 'onnx-community/Qwen2.5-0.5B-Instruct', {
        progress_callback: (p: { progress?: number }) => {
          if (typeof p.progress === 'number') onProgress?.(Math.round(p.progress));
        },
      })) as unknown as Pipeline;
      status = 'ready';
    } catch (err) {
      status = 'error';
      throw err;
    }
  })();

  return loadingPromise;
}

/**
 * Rewrites a result's rule-based reasons into one natural sentence.
 * Falls back to joining the original reasons if the model isn't loaded or
 * generation fails — this is always an enhancement, never a dependency.
 */
export async function explainPick(item: ScoredItem, quizSummary: string): Promise<string> {
  const fallback = item.reasons.join(' · ');
  if (!generator || status !== 'ready') return fallback;

  try {
    const prompt = `You recommend one movie/show in a single warm, specific sentence (max 20 words). No preamble.
User wants: ${quizSummary}
Title: ${item.title} (${item.year})
Signals: ${item.reasons.join('; ')}
Sentence:`;

    const out = await generator(prompt, { max_new_tokens: 40, temperature: 0.6 });
    const text = out[0]?.generated_text?.split('Sentence:').pop()?.trim();
    return text && text.length > 0 && text.length < 220 ? text : fallback;
  } catch {
    return fallback;
  }
}
