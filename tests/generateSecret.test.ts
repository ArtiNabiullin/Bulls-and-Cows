import { describe, it, expect } from "vitest";
import { generateSecret } from "../game-logic/generateSecret.js"; 

describe("generateSecret", () => {
  it ("результат нужной длины",  () => {
    expect(generateSecret()).toBe();
  });
  it ("все цифры допустимы и уникальны",  () => {
    expect(generateSecret()).toBe();
  });
  it ("одинаковый детерминированный источник случайности даёт повторяемый результат",  () => {
    expect(generateSecret()).toBe();
  });
  it ("важно проверить, что секрет может начинаться с нуля",  () => {
    expect(generateSecret()).toBe();
  });
});