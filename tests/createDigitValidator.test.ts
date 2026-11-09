import { describe, it, expect } from "vitest";
import { createDigitValidator } from "../game-logic/createDigitValidator.js"; 

describe("createDigitValidator", () => {
  it("should return a function", () => {
    const validate = createDigitValidator(10);
    expect(typeof validate).toBe("function");
  });
  it ("двоичная (base: 2): цифры 0-1 допустимы", () => {
    const isBin = createDigitValidator(2);
    expect(isBin("0")).toBe(true);
    expect(isBin("1")).toBe(true);
    expect(isBin("2")).toBe(false);
  });
  it ("восьмеричная (base: 8): цифры 0-7 допустимы", () => {
    const isOct = createDigitValidator(8);
    expect(isOct("0")).toBe(true);
    expect(isOct("7")).toBe(true);
    expect(isOct("8")).toBe(false);
  });
  it ("десятичная (base: 10): цифры 0-9 допустимы", () => {
    const isDec = createDigitValidator(10);
    expect(isDec("0")).toBe(true);
    expect(isDec("9")).toBe(true);
    expect(isDec("a")).toBe(false);
    expect(isDec("A")).toBe(false);
  });
  it ("шестнадцатеричная (base: 16): цифры 0-9 допустимы, буквы a-f допустимы", () => {
    const isHex = createDigitValidator(16);
    expect(isHex("0")).toBe(true);
    expect(isHex("9")).toBe(true);

    expect(isHex("a")).toBe(true);
    expect(isHex("A")).toBe(true);
    expect(isHex("f")).toBe(true);
    expect(isHex("F")).toBe(true);
  });
  it("строка из нескольких символов не должна считаться одной цифрой", () => {
    const isHex = createDigitValidator(16);
    const isDec = createDigitValidator(10);

    expect(isHex("10")).toBe(false);
    expect(isHex("aa")).toBe(false);
    expect(isDec("99")).toBe(false);
  });
});