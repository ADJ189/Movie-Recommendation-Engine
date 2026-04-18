// js/engine.js — CineMatch Recommendation Engine

class RecommendationEngine {
  constructor() {
    this.scores = {}; // item id → score
    this.genreAffinity = {}; // genre → 0–1 weight
    this.vibeAffinity = {}; // vibe → 0–1 weight
    this.quizAnswers = {};
    this.ratingData = {}; // title id → 1–5
  }

  // ── Step 1: Process quiz answers ──────────────────────
  processQuiz(answers) {
    this.quizAnswers = answers;

    // Direct genre preference from mood
    const mood = answers.mood;
    if (mood) {
      this.genreAffinity[mood] = (this.genreAffinity[mood] || 0) + 1.0;
    }

    // Vibe preference
    const vibe = answers.vibe;
    if (vibe) {
      this.vibeAffinity[vibe] = (this.vibeAffinity[vibe] || 0) + 1.0;
    }
  }

  // ── Step 2: Process ratings ────────────────────────────
  processRatings(ratings) {
    this.ratingData = ratings;

    for (const [titleId, rating] of Object.entries(ratings)) {
      const genres = TITLE_GENRE_MAP[parseInt(titleId)] || [];
      const weight = (rating - 3) / 2; // -1 to +1 scale from 1–5 stars

      for (const g of genres) {
        if (g in this.genreAffinity || g in this.vibeAffinity) {
          // reinforce genre
          this.genreAffinity[g] = (this.genreAffinity[g] || 0) + weight * 0.5;
          this.vibeAffinity[g] = (this.vibeAffinity[g] || 0) + weight * 0.5;
        } else {
          // new signal
          if (["dark", "light", "intellectual", "feelgood", "epic"].includes(g)) {
            this.vibeAffinity[g] = (this.vibeAffinity[g] || 0) + weight * 0.4;
          } else {
            this.genreAffinity[g] = (this.genreAffinity[g] || 0) + weight * 0.4;
          }
        }
      }
    }
  }

  // ── Step 3: Score catalog ──────────────────────────────
  score(item) {
    let s = 0;

    // Genre match
    for (const g of item.genres) {
      s += (this.genreAffinity[g] || 0) * 30;
    }

    // Vibe match
    for (const v of item.vibe) {
      s += (this.vibeAffinity[v] || 0) * 20;
    }

    // Format match
    const fmt = this.quizAnswers.format;
    if (fmt && fmt !== "both") {
      s += item.type === fmt ? 20 : -15;
    }

    // Era match
    const era = this.quizAnswers.era;
    if (era && era !== "any") {
      const eraMap = { classic: "classic", mid: "mid", recent: "recent" };
      s += item.era === eraMap[era] ? 15 : -5;
    }

    // Language match
    const lang = this.quizAnswers.language;
    if (lang === "english") {
      s += item.language === "english" ? 10 : -20;
    } else if (lang === "subtitles") {
      s += 5; // no penalty for any language
    }

    // Company match
    const company = this.quizAnswers.company;
    if (company && item.company.includes(company)) {
      s += 10;
    }

    // Intrinsic quality bonus
    s += (item.rating - 7) * 5;

    return Math.max(0, s);
  }

  // ── Step 4: Get ranked results ─────────────────────────
  getResults() {
    const scored = CATALOG.map((item) => ({
      ...item,
      _score: this.score(item),
    }));
    scored.sort((a, b) => b._score - a._score);

    const maxScore = scored[0]?._score || 1;
    return scored.map((item) => ({
      ...item,
      matchPct: Math.min(99, Math.round((item._score / maxScore) * 100)),
    }));
  }

  // ── Why this recommendation? ──────────────────────────
  getReasons(item) {
    const reasons = [];
    const mood = this.quizAnswers.mood;
    const vibe = this.quizAnswers.vibe;

    if (mood && item.genres.includes(mood)) {
      reasons.push(`Matches your ${mood} mood`);
    }
    if (vibe && item.vibe.includes(vibe)) {
      reasons.push(`Has that ${vibe} vibe you wanted`);
    }
    if (item.rating >= 8.5) reasons.push(`Critically acclaimed (${item.rating}/10)`);
    if (this.quizAnswers.format !== "both" && item.type === this.quizAnswers.format) {
      reasons.push(item.type === "movie" ? "Perfect movie-night length" : "Great for binge-watching");
    }
    // High-rated titles that signal taste alignment
    const highRated = Object.entries(this.ratingData)
      .filter(([, r]) => r >= 4)
      .map(([id]) => parseInt(id));
    for (const hId of highRated) {
      const hGenres = TITLE_GENRE_MAP[hId] || [];
      if (hGenres.some((g) => item.genres.includes(g) || item.vibe.includes(g))) {
        const hTitle = RATING_POOL.find((t) => t.id === hId)?.title;
        if (hTitle) {
          reasons.push(`You loved ${hTitle}`);
          break;
        }
      }
    }
    return reasons.slice(0, 3);
  }
}
