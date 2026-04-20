// src/lib/tmdb.ts

const IMAGE_BASE = 'https://image.tmdb.org/t/p/';
const SIZES = { sm: 'w185', md: 'w342', lg: 'w500', xl: 'w780' } as const;

// ── Set your TMDB API key here (free at themoviedb.org/settings/api) ────────
export const TMDB_API_KEY = '';
export const TMDB_ACCESS_TOKEN = '';

const cache = new Map<number, string | null>();

export function posterUrl(path: string, size: keyof typeof SIZES = 'lg'): string {
  return `${IMAGE_BASE}${SIZES[size]}${path}`;
}

export function backdropUrl(path: string): string {
  return `${IMAGE_BASE}${SIZES.xl}${path}`;
}

export async function fetchLivePoster(
  tmdbId: number,
  tmdbType: 'movie' | 'tv',
  fallbackPath: string
): Promise<string> {
  if (cache.has(tmdbId)) return cache.get(tmdbId) ?? posterUrl(fallbackPath);

  // Use baked-in path if no API key — still pulls from TMDB CDN
  if (!TMDB_API_KEY && !TMDB_ACCESS_TOKEN) {
    const url = posterUrl(fallbackPath);
    cache.set(tmdbId, url);
    return url;
  }

  try {
    const endpoint = tmdbType === 'tv'
      ? `https://api.themoviedb.org/3/tv/${tmdbId}`
      : `https://api.themoviedb.org/3/movie/${tmdbId}`;

    const headers: HeadersInit = TMDB_ACCESS_TOKEN
      ? { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` }
      : {};
    const url2 = TMDB_API_KEY ? `${endpoint}?api_key=${TMDB_API_KEY}` : endpoint;

    const res = await fetch(url2, { headers });
    const data = await res.json() as { poster_path?: string };
    const path = data.poster_path ?? fallbackPath;
    const result = posterUrl(path);
    cache.set(tmdbId, result);
    return result;
  } catch {
    const url = posterUrl(fallbackPath);
    cache.set(tmdbId, url);
    return url;
  }
}
