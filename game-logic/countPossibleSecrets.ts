const cache = new Map<string, number>();

function countRecursively(length: number, base: number): number {
  if (length === 0) {
    return 1;
  }

  if (length > base) {
    return 0;
  }

  const key = `${length}:${base}`;
  const cachedResult = cache.get(key);

  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const result = base * countRecursively(length - 1, base - 1);
  cache.set(key, result);
  return result;
}

export function countPossibleSecrets(length: number, base: number): number {
  if (!Number.isInteger(length) || length < 0) {
    throw new RangeError('Length must be a non-negative integer.');
  }

  if (!Number.isInteger(base) || base < 2 || base > 36) {
    throw new RangeError('Base must be an integer between 2 and 36.');
  }

  return countRecursively(length, base);
}
