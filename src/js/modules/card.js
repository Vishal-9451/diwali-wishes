import { $, el, observeSize, toast, debounce } from '../utils/helpers.js';
import { getState, setState } from '../state.js';
import { CARD_FONTS, CARD_TEMPLATES, CARD_SIZE, LIMITS } from '../utils/constants.js';
import { makeRangoli } from '../utils/decor.js';
import { sanitizeName, sanitizeText } from '../utils/validation.js';
import { extractBody } from './wishes.js';
import { getCategory } from '../data/wishes.js';
import { downloadCardPng, downloadCardPdf } from './export.js';

export function createCardStudio(root, { onNext }) {
  const card = $('#greeting-card', root);
  const stage = $('#card-stage', root);
  const scaler = $('#card-scaler', root);
  const toEl = $('#card-to', root);
  const msgEl = $('#card-msg', root);
  const fromEl = $('#card-from', root);
  const inTo = $('#card-recipient', root);
  const inFrom = $('#card-sender', root);
  const inMsg = $('#card-message', root);
  const fontSel = $('#card-font', root);
  const sizeIn = $('#card-size', root);
  const sizeOut = $('#card-size-out', root);
  const count = $('#card-count', root);
  const status = $('#card-status', root);
  const pngBtn = $('#card-png', root);
  const pdfBtn = $('#card-pdf', root);
  let busy = false;

  $('#card-deco-top', root).append(makeRangoli({ rings: 3, petals: 10 }));
  $('#card-deco-bottom', root).append(makeRangoli({ rings: 3, petals: 10 }));

  CARD_FONTS.forEach((f) => fontSel.append(el('option', { value: f.id, text: f.label })));

  // Template chips
  const tplHost = $('#card-template-group', root);
  CARD_TEMPLATES.forEach((t) => {
    const id = `card-tpl-${t.id}`;
    const input = el('input', { type: 'radio', name: 'card-tpl', id, value: t.id, class: 'chip__input' });
    input.addEventListener('change', () => { setState({ card: { template: t.id } }); render(); });
    tplHost.append(input, el('label', { for: id, class: 'chip', text: t.label }));
  });

  // Scale the fixed 600x800 card to the available width
  observeSize(stage, (w) => {
    if (!w) return;
    const s = Math.min(1, w / CARD_SIZE.width);
    scaler.style.transform = `scale(${s})`;
    scaler.style.width = `${CARD_SIZE.width}px`;
    scaler.style.height = `${CARD_SIZE.height}px`;
    stage.style.height = `${CARD_SIZE.height * s}px`;
  });

  /** Shrink the message font until it fits the card body. */
  function fit() {
    const { size, font } = getState().card;
    const f = CARD_FONTS.find((x) => x.id === font) || CARD_FONTS[0];
    msgEl.style.fontFamily = toEl.style.fontFamily = fromEl.style.fontFamily = f.css;
    let fs = size;
    msgEl.style.fontSize = `${fs}px`;
    while (fs > 12 && msgEl.scrollHeight > msgEl.clientHeight + 1) {
      fs -= 1;
      msgEl.style.fontSize = `${fs}px`;
    }
  }

  function render() {
    const c = getState().card;
    card.className = `card card--${c.template}`;
    toEl.textContent = c.recipient ? `Dear ${c.recipient},` : '';
    fromEl.textContent = c.sender ? `With love, ${c.sender}` : '';
    msgEl.textContent = c.message;
    const isHi = /[\u0900-\u097F]/.test(c.message);
    msgEl.setAttribute('lang', isHi ? 'hi' : 'en');
    sizeOut.textContent = `${c.size}px`;
    count.textContent = String(c.message.length);
    tplHost.querySelectorAll('input').forEach((i) => { i.checked = i.value === c.template; });
    if (fontSel.value !== c.font) fontSel.value = c.font;
    if (sizeIn.value !== String(c.size)) sizeIn.value = String(c.size);
    fit();
  }
  const refit = debounce(fit, 60);

  inTo.addEventListener('input', () => { setState({ card: { recipient: sanitizeName(inTo.value), touched: true } }); render(); });
  inFrom.addEventListener('input', () => { setState({ card: { sender: sanitizeName(inFrom.value), touched: true } }); render(); });
  inMsg.addEventListener('input', () => { setState({ card: { message: sanitizeText(inMsg.value, LIMITS.cardMessage), touched: true } }); render(); });
  fontSel.addEventListener('change', () => { setState({ card: { font: fontSel.value } }); render(); document.fonts?.load(`22px ${CARD_FONTS.find((f) => f.id === fontSel.value).css.split(',')[0]}`).then(refit).catch(() => {}); });
  sizeIn.addEventListener('input', () => { setState({ card: { size: Number(sizeIn.value) } }); render(); });

  async function run(kind) {
    if (busy) return;
    busy = true;
    pngBtn.disabled = pdfBtn.disabled = true;
    status.textContent = kind === 'png' ? 'Preparing your PNG…' : 'Preparing your PDF…';
    try {
      const name = getState().card.recipient;
      const info = await (kind === 'png' ? downloadCardPng(card, name) : downloadCardPdf(card, name));
      status.textContent = `Downloaded ${kind.toUpperCase()} (${info.width}×${info.height}px).`;
      toast(`Your card was downloaded as ${kind.toUpperCase()}.`);
    } catch (err) {
      console.error(err);
      status.textContent = '';
      toast(`Export failed: ${err.message || 'unknown error'}. Please try again.`, 'error');
    } finally {
      busy = false;
      pngBtn.disabled = pdfBtn.disabled = false;
    }
  }
  pngBtn.addEventListener('click', () => run('png'));
  pdfBtn.addEventListener('click', () => run('pdf'));
  $('#card-next', root).addEventListener('click', () => onNext?.());

  return {
    enter() {
      const s = getState();
      if (!s.card.touched) {
        const cat = getCategory(s.relationship);
        setState({
          card: {
            recipient: s.recipient || cat.fallback[s.language],
            sender: s.sender,
            message: sanitizeText(extractBody(s.wish.text), LIMITS.cardMessage),
          },
        });
      }
      const c = getState().card;
      inTo.value = c.recipient;
      inFrom.value = c.sender;
      inMsg.value = c.message;
      render();
      document.fonts?.ready.then(refit);
    },
    /** Called after "Restart": next visit rebuilds the card from the new wish. */
    reset() { setState({ card: { touched: false } }); },
  };
}
