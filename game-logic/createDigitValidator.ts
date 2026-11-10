import { DIGIT_ALPHABET } from './digitAlphabet.js';

export function createDigitValidator(base: number): (char: string) => boolean {
  if (!Number.isInteger(base) || base < 2 || base > DIGIT_ALPHABET.length) {
    throw new RangeError('Base must be an integer between 2 and 36.');
  }

  const validDigits = DIGIT_ALPHABET.slice(0, base);

  return (char: string): boolean =>
    char.length === 1 && validDigits.includes(char.toLowerCase());
}
