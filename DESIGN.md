# Design

## Data structures and algorithms

- `GameState` in `game-logic/gameState.ts` stores the round settings, secret,
  status, timestamps, and a readonly attempt history. `recordGuess` returns a
  new state with a copied history array; it does not modify the previous state.
  Duplicate guesses are detected case-insensitively and leave the state intact.
- A secret is a string from the shared digit alphabet in
  `game-logic/digitAlphabet.ts`. Keeping it as text preserves leading zeroes.
  `generateSecret` selects digits from a shrinking pool, so it cannot produce
  duplicates.
- `evaluateGuess` lowercases the inputs, counts exact-position matches with
  `map`/`filter`, then uses a `Set` to count shared digits. Cows are the shared
  digits minus bulls.
- `countPossibleSecrets` follows the recurrence
  `P(length, base) = base * P(length - 1, base - 1)` with `P(0, base) = 1`.
  A module-level map memoizes each `(length, base)` result.
- `createDigitValidator(base)` returns a predicate for that base. It is reused
  by whole-guess validation and by the input filter in `src/main.ts`.
- The leaderboard stores at most ten score objects in `localStorage`, sorted
  first by attempts and then by elapsed time. Each score includes its base and
  secret length so results from different modes remain distinguishable.

## Complexity

Let `n` be the secret length and `b` the number of digits in the base.

- `generateSecret`: `O(b * n)` time and `O(b)` additional space. Selecting a
  digit removes it from an array, which may shift up to `b` elements; the pool
  and result together use space proportional to `b`.
- `evaluateGuess`: expected `O(n)` time and `O(n)` space. It creates normalized
  character arrays and a `Set`, then performs a constant expected number of
  set lookups for each digit.
- `isValidGuess`: expected `O(n)` time and `O(n)` space. It checks each digit
  once and builds a `Set` of normalized digits to detect duplicates.
- `countPossibleSecrets`: `O(n)` time on a cold call and `O(n)` cache space for
  the recursive states; a repeated call for a cached pair is `O(1)`.

## Clean-code practices

- Functions have one responsibility: `createDigitValidator` creates a
  base-specific predicate, `evaluateGuess` calculates feedback, and
  `recordGuess` validates and returns the next round state.
- Dependencies that make randomness nondeterministic are injectable through
  `generateSecret`'s `random` parameter, making its output repeatable in tests.
- Domain names (`bulls`, `cows`, `history`, `finishedAt`) describe the game
  concepts directly. `GameState` and `Score` keep related values together.
- The game logic in `game-logic/` is TypeScript without DOM or storage access.
  `src/main.ts` owns browser interaction and persists only leaderboard scores.
- DOM content is created with element APIs and `textContent`; dynamic values
  are not parsed as HTML. Settings and game state are replaced rather than
  mutated when a round changes.
