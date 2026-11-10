import { describe, expect, it } from 'vitest';
import { createGameState, recordGuess } from '../game-logic/gameState.js';

describe('game state', () => {
  const settings = { length: 4, base: 10 };
  const secret = '1234';
  const startedAt = 1_000;

  it('creates a playing game with an empty history', () => {
    const state = createGameState(settings, secret, startedAt);

    expect(state.status).toBe('playing');
    expect(state.history).toEqual([]);
    expect(state.finishedAt).toBeNull();
  });

  it('appends an attempt without changing the previous state', () => {
    const initialState = createGameState(settings, secret, startedAt);
    const nextState = recordGuess(initialState, '4321', 2_000);

    expect(initialState.history).toEqual([]);
    expect(nextState.history).toEqual([
      { guess: '4321', bulls: 0, cows: 4, submittedAt: 2_000 },
    ]);
  });

  it('does not add the same guess twice, regardless of hex letter case', () => {
    const initialState = createGameState(
      { length: 4, base: 16 },
      'a12b',
      startedAt
    );
    const firstAttempt = recordGuess(initialState, 'bc21', 2_000);
    const duplicateAttempt = recordGuess(firstAttempt, 'BC21', 3_000);

    expect(duplicateAttempt).toBe(firstAttempt);
  });

  it('marks the game as won and records its finish time', () => {
    const initialState = createGameState(settings, secret, startedAt);
    const wonState = recordGuess(initialState, secret, 2_500);

    expect(wonState.status).toBe('won');
    expect(wonState.finishedAt).toBe(2_500);
  });

  it('rejects guesses that do not match the game settings', () => {
    const state = createGameState(settings, secret, startedAt);

    expect(() => recordGuess(state, '12a4', 2_000)).toThrow();
  });
});
