import { describe, it, expect } from "vitest";
import { createDigitValidator } from "../game-logic/createDigitValidator.js"; 

describe("createDigitValidator", () => {
  it("shoud return a function", () => {
    const validate = createDigitValidator(10);
    expect(typeof validate).toBe("function");
  });
  it ( () => {
    expect().toBe();
  });
});