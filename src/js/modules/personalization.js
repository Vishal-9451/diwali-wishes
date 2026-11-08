import { $, el, copyText, toast } from '../utils/helpers.js';
import { getState, setState } from '../state.js';
import { CATEGORIES, LANGUAGES, TONES } from '../data/wishes.js';
import { allowedTones } from '../data/wishes.js';
import { sanitizeName, sanitizeText, validateStudio } from '../utils/validation.js';
import { LIMITS } from '../utils/constants.js';
import { chooseTemplate, composeWish, resolveTone, templateFits, matchingTemplates } from './wishes.js';

function radioGroup(host, name, items, onChange) {
  const inputs = new Map();
  items.forEach((item) => {
    const id = `${name}-${item.id}`;
    const input = el('input', { type: 'radio', name, id, value: item.id, class: 'chip__input' });
    const label = el('label', { for: id, class: 'chip', text: item.label });
    if (item.lang) label.setAttribute('lang', item.lang === 'hi' ? 'hi' : 'en');
    input.addEventListener('change', () => { if (input.checked) onChange(item.id); });
    host.append(input, label);
    inputs.set(item.id, input);
  });
  return {
    set(value) { inputs.forEach((i, id) => { i.checked = id === value; }); },
    disable(fn) { inputs.forEach((i, id) => { const off = fn(id); i.disabled = off; i.parentElement.querySelector(`label[for="${i.id}"]`)?.classList.toggle('is-disabled', off); }); },
  };
}

export function createStudio(root, { onContinue }) {
  const $r = $('#in-recipient', root);
  const $s = $('#in-sender', root);
  const $c = $('#in-custom', root);
  const $count = $('#custom-count', root);
  const preview = $('#preview-text', root);
  const tools = $('#wish-tools', root);
  const edit = $('#wish-edit', root);
  const editNote = $('#edit-note', root);
  const toneNote = $('#tone-note', root);
  const cont = $('#btn-continue', root);
  const contHint = $('#continue-hint', root);
  const form = $('#studio-form', root);

  const rel = radioGroup($('#rel-group', root), 'rel', CATEGORIES, (v) => update({ relationship: v }, true));
  const lang = radioGroup($('#lang-group', root), 'lang', LANGUAGES, (v) => update({ language: v }));
  const tone = radioGroup($('#tone-group', root), 'tone', TONES, (v) => update({ tone: v }, true));

  const errs = {
    recipient: $('#err-recipient', root),
    relationship: $('#err-relationship', root),
  };
  const clearErrors = () => {
    Object.values(errs).forEach((e) => { e.textContent = ''; });
    $r.removeAttribute('aria-invalid');
  };

  /** Apply a settings change; keep the template valid; rebuild the text unless the person edited it. */
  function update(patch, retemplate = false) {
    const s = { ...getState(), ...patch };
    // Make sure the tone is legal for this relationship (no romantic wishes for family etc.).
    const resolved = resolveTone(s.relationship, s.tone);
    let toneChanged = false;
    if (resolved !== s.tone) { s.tone = resolved; toneChanged = true; }
    let templateId = s.wish.templateId;
    if (retemplate || !templateFits(templateId, s.relationship, s.tone)) {
      templateId = chooseTemplate({ relationship: s.relationship, tone: s.tone, currentId: templateId, mode: 'first' });
    }
    const wish = { ...s.wish, templateId };
    if (!wish.edited) wish.text = composeWish({ ...s, templateId });
    setState({ ...patch, tone: s.tone, wish });
    if (toneChanged && 'relationship' in patch) toast(`"${TONES.find((t) => t.id === getState().tone).label}" tone selected - the best match for this relationship.`);
    render();
  }

  function render() {
    const s = getState();
    rel.set(s.relationship);
    lang.set(s.language);
    tone.set(s.tone);
    const allowed = allowedTones(s.relationship);
    tone.disable((id) => !allowed.includes(id));
    toneNote.textContent = allowed.length < TONES.length ? `Available for ${CATEGORIES.find((c) => c.id === s.relationship).label}: ${allowed.map((a) => TONES.find((t) => t.id === a).label).join(', ')}.` : '';
    preview.textContent = s.wish.text;
    preview.setAttribute('lang', s.language === 'hi' ? 'hi' : 'en');
    if (document.activeElement !== edit && edit.value !== s.wish.text) edit.value = s.wish.text;
    tools.hidden = !s.generated;
    cont.disabled = !s.generated;
    contHint.hidden = s.generated;
    editNote.textContent = s.wish.edited ? 'Your edits are kept. Press Regenerate to rebuild from the settings.' : '';
    $count.textContent = String($c.value.length);
  }

  $r.addEventListener('input', () => { $r.value = $r.value.slice(0, LIMITS.name); update({ recipient: sanitizeName($r.value) }); if ($r.value.trim()) { errs.recipient.textContent = ''; $r.removeAttribute('aria-invalid'); } });
  $s.addEventListener('input', () => update({ sender: sanitizeName($s.value) }));
  $c.addEventListener('input', () => update({ customMessage: sanitizeText($c.value, LIMITS.customMessage) }));
  edit.addEventListener('input', () => {
    const text = sanitizeText(edit.value, LIMITS.wishText);
    setState({ wish: { text, edited: true } });
    render();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const s = getState();
    const { ok, errors } = validateStudio({ ...s, recipient: $r.value });
    if (!ok) {
      Object.entries(errors).forEach(([k, msg]) => { if (errs[k]) errs[k].textContent = msg; });
      if (errors.recipient) { $r.setAttribute('aria-invalid', 'true'); $r.focus(); }
      return;
    }
    const templateId = chooseTemplate({ relationship: s.relationship, tone: s.tone, currentId: s.wish.templateId, mode: s.generated ? 'random' : 'first' });
    const next = { ...s, templateId, recipient: sanitizeName($r.value) };
    setState({ recipient: next.recipient, generated: true, wish: { templateId, text: composeWish(next), edited: false } });
    render();
    toast('Your wish is ready. You can edit it below.');
    edit.focus({ preventScroll: false });
  });

  $('#btn-regen', root).addEventListener('click', () => {
    const s = getState();
    const templateId = chooseTemplate({ relationship: s.relationship, tone: s.tone, currentId: s.wish.templateId, mode: 'random' });
    setState({ wish: { templateId, text: composeWish({ ...s, templateId }), edited: false } });
    render();
    if (matchingTemplates(s.relationship, s.tone).length < 2) toast('Only one wish matches this tone - try another tone for more variety.');
  });
  $('#btn-shuffle', root).addEventListener('click', () => {
    const s = getState();
    const templateId = chooseTemplate({ relationship: s.relationship, tone: s.tone, currentId: s.wish.templateId, mode: 'next' });
    setState({ wish: { templateId, text: composeWish({ ...s, templateId }), edited: false } });
    render();
  });
  $('#btn-copy', root).addEventListener('click', async () => {
    const ok = await copyText(getState().wish.text);
    toast(ok ? 'Wish copied to the clipboard.' : 'Could not copy automatically - select the text and copy it.', ok ? 'info' : 'error');
  });
  cont.addEventListener('click', () => { if (getState().generated) onContinue?.(); });

  return {
    /** Push state values into the inputs (used on load and after "Restart"). */
    sync() {
      const s = getState();
      $r.value = s.recipient;
      $s.value = s.sender;
      $c.value = s.customMessage;
      clearErrors();
      if (!s.wish.templateId || (!s.wish.edited && !s.wish.text)) update({}, true);
      else render();
    },
    focusFirst() { $r.focus({ preventScroll: true }); },
  };
}
