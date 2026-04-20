// src/stores/appState.svelte.ts
import type { Screen, QuizAnswers } from '../lib/types';

export const appState = $state({
  screen: 'landing' as Screen,
  quizAnswers: {} as QuizAnswers,
  ratings: {} as Record<number, number>,
  direction: 'forward' as 'forward' | 'back',
});

export function goTo(screen: Screen, dir: 'forward' | 'back' = 'forward') {
  appState.direction = dir;
  appState.screen = screen;
}
