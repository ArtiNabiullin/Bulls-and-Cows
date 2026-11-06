import { describe, it, expect } from "vitest";
import { isValidGuess } from "../game-logic/isValidGuess.js"; 

describe("isValidGuess", () => {
  it ("правильная длина и допустимые неповторяющиеся цифры", () => {
    expect(isValidGuess('1234', 4, 10)).toBe(true);
  });
  it ("длина не совпадает", () => {
    expect(isValidGuess('123', 4, 8)).toBe(false);
  });
  it ("есть запрещённый символ", () => {
    expect(isValidGuess('123a', 4, 8)).toBe(false);
  });
  it ("есть повтор цифры", () => {
    expect(isValidGuess('1233', 4, 16)).toBe(false);
  });
  it ("hex-символы в разном регистре считаются одной цифрой: например, aA — повтор", () => {
    expect(isValidGuess('12aA', 4, 16)).toBe(false);
  });
});