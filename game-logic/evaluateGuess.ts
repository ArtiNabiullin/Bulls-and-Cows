export interface GuessResult {
  bulls: number;
  cows: number;
}

export function evaluateGuess(secret: string, guess: string): GuessResult {
  const secretDigits = [...secret.toLowerCase()];
  const guessDigits = [...guess.toLowerCase()];
  const secretDigitSet = new Set(secretDigits);
  const bulls = guessDigits
    .map((digit, index) => digit === secretDigits[index])
    .filter(Boolean).length;
  const matchingDigits = guessDigits.filter((digit) =>
    secretDigitSet.has(digit)
  ).length;

  return { bulls, cows: matchingDigits - bulls };
}
