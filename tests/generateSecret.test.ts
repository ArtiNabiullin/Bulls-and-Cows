import { describe, it, expect } from "vitest";
import { generateSecret } from "../game-logic/generateSecret.js"; 

describe("generateSecret", () => {
  it("результат нужной длины", () => {
    const secret = generateSecret(4, 10) as string;
    expect(secret).toHaveLength(4);
  });

  it("все цифры допустимы и уникальны", () => {
    const length = 5;
    const base = 10;
    const secret = generateSecret(length, base) as string;

    const uniqueChars = new Set(secret);
    expect(uniqueChars.size).toBe(length);

    for (const char of secret) {
      const value = parseInt(char, base);
      expect(isNaN(value)).toBe(false);
      expect(value).toBeLessThan(base);
    }
  });

  it("одинаковый детерминированный источник случайности даёт повторяемый результат", () => {
    const createPredictableRandom = (): (() => number) => {
      let values = [0.1, 0.4, 0.2, 0.8];
      let index = 0;
      return () => values[index++] || 0;
    };

    const secret1 = generateSecret(4, 10, createPredictableRandom()) as string;
    const secret2 = generateSecret(4, 10, createPredictableRandom()) as string;

    expect(secret1).toBe(secret2);
  });

  it("важно проверить, что секрет может начинаться с нуля", () => {
    const createLeadingZeroRandom = (): (() => number) => {
      let values = [0.01, 0.2, 0.5, 0.9];
      let index = 0;
      return () => values[index++] || 0;
    };

    const secret = generateSecret(4, 10, createLeadingZeroRandom()) as string;
    
    expect(secret.startsWith('0')).toBe(true);
  });
});
