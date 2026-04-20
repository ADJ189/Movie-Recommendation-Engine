# 🎬 CineMatch v3

Buttery-smooth movie & TV recommendation app. Built with **Svelte 5 + TypeScript + Vite**.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Svelte 5 (Runes) |
| Language | TypeScript |
| Build | Vite 5 |
| Styling | Scoped CSS (no Tailwind bloat) |
| Images | TMDB CDN (no API key required for posters) |
| Background | Custom Navier-Stokes fluid sim (Canvas2D) |

**Bundle size:** ~78 KB JS (gzip: 29 KB) · ~21 KB CSS (gzip: 4 KB)

---

## Running Locally

```bash
npm install
npm run dev      # dev server at localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build
```

---

## Project Structure

```
src/
├── main.ts                      # Entry point
├── App.svelte                   # Root router + grain overlay
├── stores/
│   └── appState.svelte.ts       # Svelte 5 $state global store
├── lib/
│   ├── types.ts                 # TypeScript interfaces
│   ├── data.ts                  # 30-title catalog + quiz questions
│   ├── engine.ts                # Recommendation engine
│   ├── fluid.ts                 # Navier-Stokes fluid simulation
│   └── tmdb.ts                  # TMDB image URL helpers
└── components/
    ├── FluidCanvas.svelte        # WebGL-like fluid background
    ├── Landing.svelte            # Hero screen
    ├── Quiz.svelte               # 6-question preference quiz
    ├── Rating.svelte             # Taste calibration (star ratings)
    └── Results.svelte            # Match results + runner-ups
```

---

## Adding a TMDB API Key (optional)

All 30 poster paths are pre-baked in — the app works without a key, loading images directly from `image.tmdb.org`. To enable live data fetching:

1. Get a free key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Open `src/lib/tmdb.ts` and add it:
```ts
export const TMDB_API_KEY = 'your_key_here';
```

---

## Deploy to GitHub Pages

```bash
npm run build
# Push the dist/ folder, or use gh-pages:
npx gh-pages -d dist
```

Or just push the whole repo and configure Pages to use GitHub Actions with the Vite template.

---

## How the Engine Works

1. **Quiz** — 6 answers build `genreAffinity` + `vibeAffinity` maps  
2. **Ratings** — Known titles carry genre signals; 5★ boosts, 1★ penalises  
3. **Scoring** — Every catalog item scored on genre (×30), vibe (×20), format (±20), era (±15), language (±10/−20), company (±10), quality (×5)  
4. **Output** — Sorted by score, top match with reasons + 4 runner-ups

> This product uses the TMDB API but is not endorsed or certified by TMDB.
