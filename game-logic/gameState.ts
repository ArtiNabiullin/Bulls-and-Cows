import { evaluateGuess } from './evaluateGuess.js';
import type { GuessResult } from './evaluateGuess.js';
import { isValidGuess } from './isValidGuess.js';

export interface GameSettings {
  readonly length: number;
  readonly base: number;
}

export interface GameAttempt extends GuessResult {
  readonly guess: string;
  readonly submittedAt: number;
}

export interface GameState {
  readonly settings: GameSettings;
  readonly secret: string;
  readonly status: 'playing' | 'won';
  readonly startedAt: number;
  readonly finishedAt: number | null;
  readonly history: readonly GameAttempt[];
}

export function createGameState(
  settings: GameSettings,
  secret: string,
  startedAt: number
): GameState {
  if (!Number.isFinite(startedAt)) {
    throw new RangeError('Start time must be a finite timestamp.');
  }

  if (!isValidGuess(secret, settings.length, settings.base)) {
    throw new TypeError('Secret must be valid for the selected settings.');
  }

  return {
    settings: { ...settings },
    secret,
    status: 'playing',
    startedAt,
    finishedAt: null,
    history: [],
  };
}

export function recordGuess(
  state: GameState,
  guess: string,
  submittedAt: number
): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  if (!Number.isFinite(submittedAt) || submittedAt < state.startedAt) {
    throw new RangeError(
      'Guess time must be a finite time after the game starts.'
    );
  }

  if (!isValidGuess(guess, state.settings.length, state.settings.base)) {
    throw new TypeError('Guess must be valid for the selected settings.');
  }

  const normalizedGuess = guess.toLowerCase();

  if (
    state.history.some(
      (attempt) => attempt.guess.toLowerCase() === normalizedGuess
    )
  ) {
    return state;
  }

  const result = evaluateGuess(state.secret, guess);
  const hasWon = result.bulls === state.settings.length;

  return {
    ...state,
    status: hasWon ? 'won' : 'playing',
    finishedAt: hasWon ? submittedAt : null,
    history: [...state.history, { guess, ...result, submittedAt }],
  };
}
