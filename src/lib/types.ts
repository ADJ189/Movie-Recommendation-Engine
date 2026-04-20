// src/lib/types.ts

export type Screen = 'landing' | 'quiz' | 'rating' | 'results';

export type Genre = 'thriller' | 'comedy' | 'drama' | 'scifi' | 'horror' | 'adventure';
export type Vibe = 'dark' | 'light' | 'intellectual' | 'feelgood' | 'epic';
export type Era = 'classic' | 'mid' | 'recent' | 'any';
export type Format = 'movie' | 'series' | 'both';
export type Company = 'solo' | 'date' | 'friends' | 'family';
export type Language = 'english' | 'subtitles' | 'any_lang';

export interface QuizAnswers {
  mood?: Genre;
  format?: Format;
  era?: Era;
  vibe?: Vibe;
  company?: Company;
  language?: Language;
}

export interface QuizOption {
  label: string;
  value: string;
  icon: string;
}

export interface QuizQuestion {
  id: keyof QuizAnswers;
  question: string;
  emoji: string;
  options: QuizOption[];
}

export interface CatalogItem {
  id: number;
  title: string;
  year: number;
  type: 'movie' | 'series';
  tmdbId: number;
  tmdbType: 'movie' | 'tv';
  posterPath: string;
  backdropPath: string;
  accentColor: string;
  accentLight: string;
  genres: Genre[];
  vibe: Vibe[];
  language: string;
  era: Era;
  company: Company[];
  rating: number;
  desc: string;
  tags: string[];
  _score?: number;
  matchPct?: number;
}

export interface RatingItem {
  id: number;
  title: string;
  emoji: string;
  year: number;
  tmdbId: number;
  tmdbType: 'movie' | 'tv';
}

export type RatingValue = 1 | 2 | 3 | 4 | 5;

export interface GenreAffinityMap {
  [key: string]: number;
}
