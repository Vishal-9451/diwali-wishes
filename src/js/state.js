import { STORAGE_KEY } from './utils/constants.js';

/** Minimal observable store with safe LocalStorage persistence for preferences only. */
const PERSISTED = ['relationship', 'language', 'tone', 'music', 'card'];

const defaults = () => ({
  screen: 'intro',
  recipient: '',
  sender: '',
  relationship: 'everyone',
  language: 'en',
  tone: 'traditional',
  customMessage: '',
  generated: false,
  shared: false, // opened from a personalized link
  wish: { templateId: '', text: '', edited: false },
  music: { playing: false, muted: false, volume: 0.6 },
  card: { template: 'royal', font: 'cormorant', size: 22, recipient: '', sender: '', message: '', touched: false },
  gift: { opened: false },
});

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    const out = {};
    if (typeof data.relationship === 'string') out.relationship = data.relationship;
    if (typeof data.language === 'string') out.language = data.language;
    if (typeof data.tone === 'string') out.tone = data.tone;
    if (data.music && typeof data.music === 'object') {
      const v = Number(data.music.volume);
      out.music = { muted: Boolean(data.music.muted), volume: Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.6 };
    }
    if (data.card && typeof data.card === 'object') {
      out.card = { template: data.card.template, font: data.card.font, size: Number(data.card.size) || 22 };
    }
    return out;
  } catch {
    return {};
  }
}

function save(state) {
  try {
    const slice = {
      relationship: state.relationship,
      language: state.language,
      tone: state.tone,
      music: { muted: state.music.muted, volume: state.music.volume },
      card: { template: state.card.template, font: state.card.font, size: state.card.size },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slice));
  } catch {
    /* storage unavailable (private mode / quota) - preferences simply are not saved */
  }
}

const listeners = new Set();
let state = defaults();
const saved = load();
state = {
  ...state,
  ...saved,
  music: { ...state.music, ...(saved.music || {}), playing: false },
  card: { ...state.card, ...(saved.card || {}) },
};

export const getState = () => state;

/** Merge a patch (shallow, with one-level merge for object slices) and notify. */
export function setState(patch) {
  const prev = state;
  const next = { ...state };
  for (const [k, v] of Object.entries(patch)) {
    next[k] = v && typeof v === 'object' && !Array.isArray(v) && typeof prev[k] === 'object' ? { ...prev[k], ...v } : v;
  }
  state = next;
  if (PERSISTED.some((k) => prev[k] !== state[k])) save(state);
  listeners.forEach((fn) => fn(state, prev));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Clear the personal content but keep saved preferences. Used by "Restart". */
export function resetExperience() {
  const keep = { relationship: state.relationship, language: state.language, tone: state.tone, music: state.music };
  state = { ...defaults(), ...keep, music: { ...state.music, playing: state.music.playing } };
  listeners.forEach((fn) => fn(state, state));
}
