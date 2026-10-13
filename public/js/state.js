/** Persistent, observable toggle state for every "ลูกเล่น" in the deck. */

const STORAGE_KEY = 'whp042.prefs.v2';

export const DEFAULTS = Object.freeze({
  rain: true,
  eyes: true,
  particles: true,
  chibi: true,
  dino: true,
  glitch: true,
  scan: true,
  grain: true,
  audio: false,
  motion: true,
  theme: 'bio',
});

const listeners = new Set();

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    const merged = { ...DEFAULTS };
    for (const key of Object.keys(DEFAULTS)) {
      if (key in parsed && typeof parsed[key] === typeof DEFAULTS[key]) {
        merged[key] = parsed[key];
      }
    }
    return merged;
  } catch {
    return { ...DEFAULTS };
  }
}

export const state = load();

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage disabled — keep in-memory only */
  }
}

export function get(key) {
  return state[key];
}

export function set(key, value, { silent = false } = {}) {
  if (!(key in DEFAULTS)) return;
  if (state[key] === value) return;
  state[key] = value;
  persist();
  if (!silent) emit({ key, value });
}

export function toggle(key) {
  set(key, !state[key]);
}

export function resetAll(overrides = {}) {
  const next = { ...DEFAULTS, ...overrides };
  const changed = [];
  for (const key of Object.keys(DEFAULTS)) {
    if (state[key] !== next[key]) {
      state[key] = next[key];
      changed.push(key);
    }
  }
  persist();
  if (changed.length) emit({ key: '*', value: null, changed });
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(payload) {
  for (const fn of listeners) {
    try { fn(payload); } catch (err) { console.error(err); }
  }
}
