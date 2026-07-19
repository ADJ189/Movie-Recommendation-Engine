// src/lib/store.ts
//
// A tiny pub-sub store. This is the entire "framework" the app needs —
// no reactivity compiler, no virtual DOM. Screens subscribe and re-render
// themselves on change.

import type { AppState, QuizAnswers, RatingValue, ScoredItem, Screen } from './types';

type Listener = (state: AppState) => void;

function createStore() {
  let state: AppState = {
    screen: 'landing',
    quizAnswers: {},
    ratings: {},
    results: [],
    loading: false,
    error: null,
  };

  const listeners = new Set<Listener>();

  function notify() {
    for (const l of listeners) l(state);
  }

  return {
    getState: () => state,
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
    setScreen(screen: Screen) {
      state = { ...state, screen, error: null };
      notify();
    },
    setQuizAnswers(answers: QuizAnswers) {
      state = { ...state, quizAnswers: answers };
      notify();
    },
    setRating(id: number, value: RatingValue) {
      state = { ...state, ratings: { ...state.ratings, [id]: value } };
      notify();
    },
    importRatings(ratings: Record<number, RatingValue>) {
      state = { ...state, ratings: { ...state.ratings, ...ratings } };
      notify();
    },
    setLoading(loading: boolean) {
      state = { ...state, loading };
      notify();
    },
    setError(error: string | null) {
      state = { ...state, error, loading: false };
      notify();
    },
    setResults(results: ScoredItem[]) {
      state = { ...state, results, loading: false, error: null };
      notify();
    },
    reset() {
      state = { screen: 'landing', quizAnswers: {}, ratings: {}, results: [], loading: false, error: null };
      notify();
    },
  };
}

export const store = createStore();
