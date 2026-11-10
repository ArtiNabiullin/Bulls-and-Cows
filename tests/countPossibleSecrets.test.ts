import { describe, it, expect } from 'vitest';
import { countPossibleSecrets } from '../game-logic/countPossibleSecrets.js';

describe('countPossibleSecrets', () => {
  it('(bin): a call with arguments 2 and 2 returns 2.', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });
  it('(oct): a call with arguments 2 and 8 returns 56.', () => {
    expect(countPossibleSecrets(2, 8)).toBe(56);
  });
  it('(dec): a call with arguments 2 and 10 returns 90.', () => {
    expect(countPossibleSecrets(2, 10)).toBe(90);
  });
  it('(hex): a call with arguments 2 and 16 returns 240.', () => {
    expect(countPossibleSecrets(2, 16)).toBe(240);
  });
  it('If the length is 1, the number of variants is equal to the number of digits in the system.', () => {
    expect(countPossibleSecrets(1, 2)).toBe(2);
  });
  it('If the length is 0, mathematically there is one option — to choose no digits at all.', () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
  });
  it("If the length is greater than the base, there won't be enough unique digits.", () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
  });
});
