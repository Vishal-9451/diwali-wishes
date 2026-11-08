import { LIMITS } from './constants.js';
import { CATEGORIES, LANGUAGES, TONES, getTemplate, allowedTones } from '../data/wishes.js';

// Strip control + bidi override characters, collapse whitespace.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g;

export function sanitizeName(value) {
  return String(value ?? '')
    .replace(CONTROL, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, LIMITS.name);
}

export function sanitizeText(value, max = LIMITS.customMessage) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/[<>]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, max);
}

const inList = (list, v) => list.some((x) => x.id === v);
export const isCategory = (v) => inList(CATEGORIES, v);
export const isLanguage = (v) => inList(LANGUAGES, v);
export const isTone = (v) => inList(TONES, v);

/** Validate the studio form. Returns { ok, errors: { field: message } }. */
export function validateStudio(s) {
  const errors = {};
  const to = sanitizeName(s.recipient);
  if (!to) errors.recipient = "Enter the recipient's name so the wish feels personal.";
  else if (to.length < 1) errors.recipient = 'Name is too short.';
  if (!isCategory(s.relationship)) errors.relationship = 'Choose who this wish is for.';
  if (!isLanguage(s.language)) errors.language = 'Choose a language.';
  if (!isTone(s.tone)) errors.tone = 'Choose a tone.';
  if (s.customMessage && s.customMessage.length > LIMITS.customMessage) {
    errors.customMessage = `Keep your own line under ${LIMITS.customMessage} characters.`;
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

/* ---------- Share URL (non-sensitive settings only) ---------- */
const PARAMS = { r: 'recipient', s: 'sender', c: 'relationship', l: 'language', n: 'tone', t: 'template' };

export function buildShareUrl(state, base = window.location.href) {
  const url = new URL(base);
  url.search = '';
  url.hash = '';
  const p = new URLSearchParams();
  const to = sanitizeName(state.recipient);
  const from = sanitizeName(state.sender);
  if (to) p.set('r', to);
  if (from) p.set('s', from);
  p.set('c', state.relationship);
  p.set('l', state.language);
  p.set('n', state.tone);
  if (state.wish?.templateId) p.set('t', state.wish.templateId);
  url.search = p.toString();
  return url.toString();
}

/**
 * Parse and validate query params. Never throws; returns null when the
 * link does not contain a valid wish.
 */
export function parseShareParams(search = window.location.search) {
  try {
    const p = new URLSearchParams(search);
    if (!p.has('c') || !p.has('t')) return null;
    const relationship = p.get('c');
    const language = p.get('l') || 'en';
    const templateId = p.get('t') || '';
    const template = getTemplate(templateId);
    if (!isCategory(relationship) || !isLanguage(language) || !template || template.category !== relationship) return null;
    let tone = p.get('n') || '';
    const allowed = allowedTones(relationship);
    if (!isTone(tone) || !allowed.includes(tone)) tone = template.tones[0];
    return {
      recipient: sanitizeName(p.get('r')),
      sender: sanitizeName(p.get('s')),
      relationship,
      language,
      tone,
      templateId,
    };
  } catch {
    return null;
  }
}
