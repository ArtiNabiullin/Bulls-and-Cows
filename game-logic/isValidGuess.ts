import { createDigitValidator } from './createDigitValidator.js';

export function isValidGuess(
  guess: string,
  length: number,
  base: number
): boolean {
  if (!Number.isInteger(length) || length < 0) {
    throw new RangeError('Length must be a non-negative integer.');
  }

  const digits = [...guess];

  if (digits.length !== length || length > base) {
    return false;
  }

  const isValidDigit = createDigitValidator(base);

  return (
    digits.every(isValidDigit) &&
    new Set(digits.map((digit) => digit.toLowerCase())).size === length
  );
}
