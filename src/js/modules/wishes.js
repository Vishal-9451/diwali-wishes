import {
  TEMPLATES, getCategory, getTemplate, getTemplatesFor, allowedTones, getPrefix, getSignoff, SENDER_FALLBACK,
} from '../data/wishes.js';
import { sanitizeName, sanitizeText } from '../utils/validation.js';
import { LIMITS } from '../utils/constants.js';

/** Pick the tone to actually use: the requested one if the category supports it. */
export function resolveTone(categoryId, tone) {
  const allowed = allowedTones(categoryId);
  if (allowed.includes(tone)) return tone;
  return allowed.includes('emotional') ? 'emotional' : allowed[0];
}

/** Templates matching the relationship + tone. */
export function matchingTemplates(categoryId, tone) {
  const t = resolveTone(categoryId, tone);
  return getTemplatesFor(categoryId).filter((tpl) => tpl.tones.includes(t));
}

/** Build the full wish text from a template id and the current settings. */
export function composeWish({ templateId, relationship, language, recipient, sender, customMessage }) {
  const tpl = getTemplate(templateId) || getTemplatesFor(relationship)[0] || TEMPLATES[0];
  const cat = getCategory(tpl.category === relationship ? relationship : tpl.category);
  const to = sanitizeName(recipient) || cat.fallback[language];
  const from = sanitizeName(sender) || SENDER_FALLBACK[language];
  const greeting = `${getPrefix(cat.id, language)} ${to},`;
  const extra = sanitizeText(customMessage, LIMITS.customMessage).trim();
  const parts = [greeting, tpl[language]];
  if (extra) parts.push(extra);
  parts.push(`${getSignoff(cat.id, language)}\n${from}`);
  return parts.join('\n\n');
}

/** Pick a template id. `mode` = 'first' | 'random' | 'next'. */
export function chooseTemplate({ relationship, tone, currentId, mode = 'random' }) {
  const list = matchingTemplates(relationship, tone);
  if (!list.length) return getTemplatesFor(relationship)[0]?.id || TEMPLATES[0].id;
  const idx = list.findIndex((t) => t.id === currentId);
  if (mode === 'first' || (idx === -1 && mode === 'next')) return list[0].id;
  if (mode === 'next') return list[(idx + 1) % list.length].id;
  if (list.length === 1) return list[0].id;
  let next;
  do {
    next = list[Math.floor(Math.random() * list.length)].id;
  } while (next === currentId);
  return next;
}

/** True when the template can legitimately be used for this relationship + tone. */
export function templateFits(templateId, relationship, tone) {
  const tpl = getTemplate(templateId);
  return Boolean(tpl && tpl.category === relationship && tpl.tones.includes(resolveTone(relationship, tone)));
}

/** Greeting-free message body (for greeting cards). */
export function extractBody(text) {
  const parts = String(text || '').split(/\n\s*\n/);
  return parts.length >= 3 ? parts.slice(1, -1).join('\n\n').trim() : String(text || '').trim();
}

/** Short opening line used on the gift reveal. */
export function firstLine(text) {
  return String(text || '').split('\n')[0];
}
