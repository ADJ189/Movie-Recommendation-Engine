// src/lib/engine.ts
import type { CatalogItem, QuizAnswers, GenreAffinityMap } from './types';
import { CATALOG, TITLE_GENRE_SIGNALS, RATING_POOL } from './data';

export interface ScoredItem extends CatalogItem {
  matchPct: number;
  reasons: string[];
}

export class RecommendationEngine {
  private genre: GenreAffinityMap = {};
  private vibe: GenreAffinityMap = {};
  private answers: QuizAnswers = {};
  private ratings: Record<number, number> = {};

  processQuiz(answers: QuizAnswers): void {
    this.answers = answers;
    if (answers.mood)  this.genre[answers.mood] = (this.genre[answers.mood] ?? 0) + 1.0;
    if (answers.vibe)  this.vibe[answers.vibe]  = (this.vibe[answers.vibe]  ?? 0) + 1.0;
  }

  processRatings(ratings: Record<number, number>): void {
    this.ratings = ratings;
    for (const [idStr, rating] of Object.entries(ratings)) {
      const id = Number(idStr);
      const signals = TITLE_GENRE_SIGNALS[id] ?? [];
      const weight = (rating - 3) / 2; // −1 to +1
      for (const signal of signals) {
        const isVibe = ['dark','light','intellectual','feelgood','epic'].includes(signal);
        if (isVibe) this.vibe[signal]  = (this.vibe[signal]  ?? 0) + weight * 0.45;
        else        this.genre[signal] = (this.genre[signal] ?? 0) + weight * 0.45;
      }
    }
  }

  private scoreItem(item: CatalogItem): number {
    let s = 0;
    for (const g of item.genres) s += (this.genre[g] ?? 0) * 30;
    for (const v of item.vibe)   s += (this.vibe[v]  ?? 0) * 20;

    const { format, era, language, company } = this.answers;
    if (format && format !== 'both')  s += item.type === format ? 20 : -15;
    if (era    && era    !== 'any')   s += item.era === era ? 15 : -5;
    if (language === 'english')       s += item.language === 'english' ? 10 : -20;
    else if (language === 'subtitles') s += 5;
    if (company && item.company.includes(company)) s += 10;

    s += (item.rating - 7) * 5; // quality bonus
    return Math.max(0, s);
  }

  private getReasonsFor(item: CatalogItem): string[] {
    const out: string[] = [];
    if (this.answers.mood && item.genres.includes(this.answers.mood))
      out.push(`Matches your ${this.answers.mood} mood`);
    if (this.answers.vibe && item.vibe.includes(this.answers.vibe))
      out.push(`Has that ${this.answers.vibe} vibe`);
    if (item.rating >= 8.5)
      out.push(`Highly acclaimed (${item.rating}/10 on TMDB)`);
    if (this.answers.format !== 'both' && item.type === this.answers.format)
      out.push(item.type === 'movie' ? 'Perfect movie-night length' : 'Great for binge-watching');
    // Taste signal from ratings
    const loved = Object.entries(this.ratings)
      .filter(([,r]) => r >= 4)
      .map(([id]) => Number(id));
    for (const hId of loved) {
      const sigs = TITLE_GENRE_SIGNALS[hId] ?? [];
      if (sigs.some(g => item.genres.includes(g as never) || item.vibe.includes(g as never))) {
        const title = RATING_POOL.find(t => t.id === hId)?.title;
        if (title) { out.push(`You loved ${title}`); break; }
      }
    }
    return out.slice(0, 3);
  }

  getResults(): ScoredItem[] {
    const scored = CATALOG.map(item => ({ ...item, _score: this.scoreItem(item) }));
    scored.sort((a, b) => b._score - a._score);
    const maxScore = scored[0]?._score ?? 1;
    return scored.map(item => ({
      ...item,
      matchPct: Math.min(99, Math.round((item._score / maxScore) * 100)),
      reasons: this.getReasonsFor(item),
    }));
  }
}
