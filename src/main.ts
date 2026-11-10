import { createGameState, recordGuess } from '../game-logic/gameState.js';
import type { GameState } from '../game-logic/gameState.js';
import { createDigitValidator } from '../game-logic/createDigitValidator.js';
import { generateSecret } from '../game-logic/generateSecret.js';
import { isValidGuess } from '../game-logic/isValidGuess.js';

interface Score {
  readonly length: number;
  readonly base: number;
  readonly attempts: number;
  readonly durationMs: number;
  readonly completedAt: number;
}

interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

const scoreStorageKey = 'bulls-and-cows.scores';
const maximumScores = 10;
const baseNames: Readonly<Record<number, string>> = {
  2: 'Binary',
  8: 'Octal',
  10: 'Decimal',
  16: 'Hexadecimal',
};
const app = document.createElement('div');
app.className = 'app';
document.body.append(app);

let selectedLength = 4;
let selectedBase = 10;
let currentGame: GameState | null = null;
let timerInterval: number | undefined;

function createElement<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  text?: string,
  className?: string
): HTMLElementTagNameMap[Tag] {
  const element = document.createElement(tag);

  if (text !== undefined) {
    element.textContent = text;
  }

  if (className !== undefined) {
    element.className = className;
  }

  return element;
}

function createSelectField(
  labelText: string,
  id: string,
  options: readonly SelectOption[],
  selectedValue: string
): { readonly wrapper: HTMLDivElement; readonly select: HTMLSelectElement } {
  const wrapper = createElement('div', undefined, 'field');
  const label = createElement('label', labelText, 'field__label');
  const select = createElement('select', undefined, 'field__control');
  select.id = id;
  label.htmlFor = id;

  options.forEach(({ value, label: optionLabel, disabled }) => {
    const option = createElement('option', optionLabel);
    option.value = value;
    option.disabled = disabled ?? false;
    option.selected = value === selectedValue;
    select.append(option);
  });

  wrapper.append(label, select);
  return { wrapper, select };
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatBase(base: number): string {
  return baseNames[base] ?? `Base ${base}`;
}

function compareScores(left: Score, right: Score): number {
  return (
    left.attempts - right.attempts ||
    left.durationMs - right.durationMs ||
    left.completedAt - right.completedAt
  );
}

function isScore(value: unknown): value is Score {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    'length' in value &&
    typeof value.length === 'number' &&
    Number.isInteger(value.length) &&
    'base' in value &&
    typeof value.base === 'number' &&
    Number.isInteger(value.base) &&
    'attempts' in value &&
    typeof value.attempts === 'number' &&
    Number.isInteger(value.attempts) &&
    'durationMs' in value &&
    typeof value.durationMs === 'number' &&
    Number.isFinite(value.durationMs) &&
    value.durationMs >= 0 &&
    'completedAt' in value &&
    typeof value.completedAt === 'number' &&
    Number.isFinite(value.completedAt)
  );
}

function readScores(): Score[] {
  const serializedScores = window.localStorage.getItem(scoreStorageKey);

  if (serializedScores === null) {
    return [];
  }

  const parsedScores: unknown = JSON.parse(serializedScores);

  if (!Array.isArray(parsedScores)) {
    throw new TypeError('Stored leaderboard must be a JSON array.');
  }

  const validScores = parsedScores.filter(isScore);

  if (validScores.length !== parsedScores.length) {
    throw new TypeError('Stored leaderboard contains an invalid score.');
  }

  return validScores.sort(compareScores).slice(0, maximumScores);
}

function saveScore(score: Score): {
  readonly scores: Score[];
  readonly persisted: boolean;
} {
  const scores = [...readScores(), score]
    .sort(compareScores)
    .slice(0, maximumScores);

  try {
    window.localStorage.setItem(scoreStorageKey, JSON.stringify(scores));
  } catch (error) {
    if (!(error instanceof DOMException)) {
      throw error;
    }

    console.error('The leaderboard could not be saved to localStorage.', error);
    return { scores, persisted: false };
  }

  return { scores, persisted: true };
}

function renderLeaderboard(scores: readonly Score[]): HTMLElement {
  const section = createElement('section', undefined, 'leaderboard');
  section.setAttribute('aria-labelledby', 'leaderboard-title');
  section.append(createElement('h2', 'Best scores', 'section-title'));
  section.lastElementChild?.setAttribute('id', 'leaderboard-title');

  if (scores.length === 0) {
    section.append(
      createElement('p', 'Your wins will appear here.', 'empty-state')
    );
    return section;
  }

  const table = createElement('table', undefined, 'data-table');
  const header = createElement('tr');

  ['#', 'Mode', 'Attempts', 'Time', 'Completed'].forEach((label) => {
    header.append(createElement('th', label));
  });

  const head = createElement('thead');
  head.append(header);
  table.append(head);

  const body = createElement('tbody');
  scores.forEach((score, index) => {
    const row = createElement('tr');
    const completedAt = new Date(score.completedAt).toLocaleDateString();
    const values = [
      String(index + 1),
      `${score.length} digits · ${formatBase(score.base)}`,
      String(score.attempts),
      formatDuration(score.durationMs),
      completedAt,
    ];

    values.forEach((value) => row.append(createElement('td', value)));
    body.append(row);
  });

  table.append(body);
  section.append(table);
  return section;
}

function renderSettings(): void {
  if (timerInterval !== undefined) {
    window.clearInterval(timerInterval);
    timerInterval = undefined;
  }

  app.replaceChildren();

  const page = createElement('main', undefined, 'page page--settings');
  const intro = createElement('header', undefined, 'page-header');
  intro.append(
    createElement('p', 'A little logic goes a long way', 'eyebrow'),
    createElement('h1', 'Bulls & Cows', 'page-title'),
    createElement(
      'p',
      'Crack the secret code. Bulls are right digits in the right place; cows are right digits in the wrong place.',
      'page-description'
    )
  );

  const card = createElement('section', undefined, 'card settings-card');
  card.append(createElement('h2', 'Set up your round', 'section-title'));

  const form = createElement('form', undefined, 'settings-form');
  const baseField = createSelectField(
    'Number system',
    'number-base',
    [
      { value: '2', label: 'Binary (0–1)' },
      { value: '8', label: 'Octal (0–7)' },
      { value: '10', label: 'Decimal (0–9)' },
      { value: '16', label: 'Hexadecimal (0–F)' },
    ],
    String(selectedBase)
  );
  const lengthField = createSelectField(
    'Secret length',
    'secret-length',
    Array.from({ length: 5 }, (_, index) => index + 2).map((length) => ({
      value: String(length),
      label: `${length} digits`,
      disabled: length > selectedBase,
    })),
    String(selectedLength)
  );

  baseField.select.addEventListener('change', () => {
    selectedBase = Number(baseField.select.value);
    selectedLength = Math.min(selectedLength, selectedBase);
    renderSettings();
  });

  lengthField.select.addEventListener('change', () => {
    selectedLength = Number(lengthField.select.value);
  });

  form.append(
    baseField.wrapper,
    lengthField.wrapper,
    createElement('button', 'Start game', 'button button--primary')
  );
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    currentGame = createGameState(
      { length: selectedLength, base: selectedBase },
      generateSecret(selectedLength, selectedBase),
      Date.now()
    );
    renderGame();
  });

  card.append(form);
  page.append(intro, card, renderLeaderboard(readScores()));
  app.append(page);
}

function renderHistory(state: GameState): HTMLElement {
  const section = createElement('section', undefined, 'history');
  section.setAttribute('aria-labelledby', 'history-title');
  const heading = createElement('h2', 'Your guesses', 'section-title');
  heading.id = 'history-title';
  section.append(heading);

  if (state.history.length === 0) {
    section.append(
      createElement(
        'p',
        'No guesses yet. Enter a code to get started.',
        'empty-state'
      )
    );
    return section;
  }

  const table = createElement('table', undefined, 'data-table');
  const header = createElement('tr');
  ['#', 'Guess', 'Bulls', 'Cows'].forEach((label) => {
    header.append(createElement('th', label));
  });

  const head = createElement('thead');
  head.append(header);
  table.append(head);

  const body = createElement('tbody');
  state.history.forEach((attempt, index) => {
    const row = createElement('tr');
    [
      String(index + 1),
      attempt.guess.toUpperCase(),
      String(attempt.bulls),
      String(attempt.cows),
    ].forEach((value) => row.append(createElement('td', value)));
    body.append(row);
  });

  table.append(body);
  section.append(table);
  return section;
}

function renderGame(): void {
  if (timerInterval !== undefined) {
    window.clearInterval(timerInterval);
    timerInterval = undefined;
  }

  const state = currentGame;

  if (state === null) {
    renderSettings();
    return;
  }

  app.replaceChildren();

  const page = createElement('main', undefined, 'page page--game');
  const header = createElement('header', undefined, 'game-header');
  const heading = createElement('div');
  heading.append(
    createElement('p', 'Round in progress', 'eyebrow'),
    createElement('h1', 'Bulls & Cows', 'page-title'),
    createElement(
      'p',
      `${state.settings.length} digits · ${formatBase(state.settings.base)}`,
      'game-mode'
    )
  );

  const timer = createElement('div', undefined, 'timer');
  timer.setAttribute('role', 'timer');
  timer.setAttribute('aria-label', 'Time elapsed');
  const timerValue = createElement('span', undefined, 'timer__value');
  timer.append(createElement('span', 'TIME', 'timer__label'), timerValue);

  const updateTimer = (): void => {
    timerValue.textContent = formatDuration(Date.now() - state.startedAt);
  };

  updateTimer();
  timerInterval = window.setInterval(updateTimer, 1_000);

  const headerActions = createElement('div', undefined, 'game-header__actions');
  const exitButton = createElement(
    'button',
    'Exit to menu',
    'button button--secondary'
  );
  exitButton.type = 'button';
  exitButton.addEventListener('click', () => {
    currentGame = null;
    renderSettings();
  });
  headerActions.append(timer, exitButton);
  header.append(heading, headerActions);

  const card = createElement('section', undefined, 'card guess-card');
  const form = createElement('form', undefined, 'guess-form');
  const label = createElement('label', 'Your guess', 'field__label');
  const guessInput = createElement(
    'input',
    undefined,
    'field__control guess-input'
  );
  const status = createElement('p', undefined, 'form-status');
  const validator = createDigitValidator(state.settings.base);
  guessInput.id = 'guess';
  guessInput.name = 'guess';
  guessInput.type = 'text';
  guessInput.autocomplete = 'off';
  guessInput.autocapitalize = 'characters';
  guessInput.spellcheck = false;
  guessInput.maxLength = state.settings.length;
  guessInput.required = true;
  guessInput.setAttribute('aria-describedby', 'guess-help guess-status');
  label.htmlFor = guessInput.id;
  status.id = 'guess-status';

  guessInput.addEventListener('input', () => {
    const filteredValue = [...guessInput.value]
      .filter(validator)
      .slice(0, state.settings.length)
      .join('');

    if (filteredValue !== guessInput.value) {
      guessInput.value = filteredValue;
    }
  });

  form.append(
    label,
    guessInput,
    createElement(
      'p',
      `Use ${state.settings.length} unique digits from the selected number system.`,
      'field__help'
    )
  );
  form.lastElementChild?.setAttribute('id', 'guess-help');
  form.append(
    createElement('button', 'Check guess', 'button button--primary'),
    status
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const guess = guessInput.value;

    if (!isValidGuess(guess, state.settings.length, state.settings.base)) {
      status.textContent = `Enter ${state.settings.length} unique valid digits.`;
      status.classList.add('form-status--error');
      guessInput.focus();
      return;
    }

    const nextState = recordGuess(state, guess, Date.now());

    if (nextState === state) {
      status.textContent = 'You already tried that guess.';
      status.classList.add('form-status--error');
      guessInput.focus();
      return;
    }

    currentGame = nextState;

    if (nextState.status === 'won' && nextState.finishedAt !== null) {
      const score: Score = {
        length: nextState.settings.length,
        base: nextState.settings.base,
        attempts: nextState.history.length,
        durationMs: nextState.finishedAt - nextState.startedAt,
        completedAt: nextState.finishedAt,
      };
      const saveResult = saveScore(score);
      renderWin(nextState, saveResult);
      return;
    }

    renderGame();
  });

  card.append(form);
  page.append(header, card, renderHistory(state));
  app.append(page);
  guessInput.focus();
}

function renderWin(
  state: GameState,
  saveResult: { readonly scores: Score[]; readonly persisted: boolean }
): void {
  if (timerInterval !== undefined) {
    window.clearInterval(timerInterval);
    timerInterval = undefined;
  }

  app.replaceChildren();

  const page = createElement('main', undefined, 'page page--win');
  const header = createElement('header', undefined, 'page-header');
  header.append(
    createElement('p', 'Code cracked', 'eyebrow'),
    createElement('h1', 'You got it!', 'page-title'),
    createElement(
      'p',
      `Solved in ${state.history.length} ${
        state.history.length === 1 ? 'guess' : 'guesses'
      } and ${formatDuration(
        (state.finishedAt ?? state.startedAt) - state.startedAt
      )}.`,
      'page-description'
    )
  );

  const actions = createElement('div', undefined, 'win-actions');
  const newGameButton = createElement(
    'button',
    'New game',
    'button button--primary'
  );
  newGameButton.type = 'button';
  newGameButton.addEventListener('click', () => {
    currentGame = null;
    renderSettings();
  });
  actions.append(newGameButton);

  const result = createElement('section', undefined, 'card win-card');
  result.append(
    createElement('p', 'The secret was', 'field__label'),
    createElement('p', state.secret.toUpperCase(), 'secret-reveal'),
    actions
  );

  if (!saveResult.persisted) {
    const warning = createElement(
      'p',
      'Your win is recorded, but the leaderboard could not be saved in this browser.',
      'form-status form-status--error'
    );
    warning.setAttribute('role', 'alert');
    result.append(warning);
  }

  page.append(
    header,
    result,
    renderHistory(state),
    renderLeaderboard(saveResult.scores)
  );
  app.append(page);
}

renderSettings();
