import { describe, it, expect } from 'vitest';
import { evaluateGuess } from '../game-logic/evaluateGuess.js';

describe('evaluateGuess', () => {
  it('полное совпадение даёт bulls по длине и ноль cows', () => {
    expect(evaluateGuess('1234', '1234')).toEqual({ bulls: 4, cows: 0 });
  });
  it('нет общих цифр — ноль bulls и ноль cows', () => {
    expect(evaluateGuess('1234', '5678')).toEqual({ bulls: 0, cows: 0 });
  });
  it('смешанный случай: часть на правильных местах, часть — на неправильных', () => {
    expect(evaluateGuess('1234', '1432')).toEqual({ bulls: 2, cows: 2 });
  });
  it('для hex регистр не влияет на сравнение', () => {
    expect(evaluateGuess('A1b2', 'a1B2')).toEqual({ bulls: 4, cows: 0 });
  });
});
