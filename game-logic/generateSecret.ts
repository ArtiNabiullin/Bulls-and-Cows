import { DIGIT_ALPHABET } from './digitAlphabet.js';

export function generateSecret(
  length: number,
  base: number,
  random: () => number = Math.random
): string {
  if (!Number.isInteger(base) || base < 2 || base > DIGIT_ALPHABET.length) {
    throw new RangeError('Base must be an integer between 2 and 36.');
  }

  if (!Number.isInteger(length) || length < 0 || length > base) {
    throw new RangeError('Length must be an integer between 0 and the base.');
  }

  const availableDigits = DIGIT_ALPHABET.slice(0, base).split('');
  const secretDigits = Array.from({ length }, () => {
    const randomValue = random();

    if (randomValue < 0 || randomValue >= 1 || !Number.isFinite(randomValue)) {
      throw new RangeError('Random source must return a value in [0, 1).');
    }

    const digitIndex = Math.floor(randomValue * availableDigits.length);
    const [digit] = availableDigits.splice(digitIndex, 1);

    if (digit === undefined) {
      throw new RangeError('Random source selected an unavailable digit.');
    }

    return digit;
  });

  return secretDigits.join('');
}
