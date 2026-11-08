import { $, $$, el, toast } from './utils/helpers.js';
import { getState, setState, subscribe, resetExperience } from './state.js';
import { parseShareParams } from './utils/validation.js';
import { NEEDS_WISH } from './utils/constants.js';
import { composeWish } from './modules/wishes.js';
import { createRouter } from './router.js';
import { initMusic } from './modules/music.js';
import { createIntro } from './modules/intro.js';
import { createStudio } from './modules/personalization.js';
import { createGiftScreen } from './modules/gift.js';
import { createCelebration } from './modules/celebration.js';
import { createRangoli } from './modules/rangoli.js';
import { createCardStudio } from './modules/card.js';
import { createShare } from './modules/share.js';

const NAV = [
  ['studio', 'Wish'], ['gift', 'Gift'], ['celebration', 'Celebrate'], ['rangoli', 'Rangoli'], ['card', 'Card'], ['share', 'Share'],
];

export function initApp() {
  // A personalised link opens straight to the gift for the recipient.
  const incoming = parseShareParams();
  if (incoming) {
    const base = getState();
    const wish = { templateId: incoming.templateId, edited: false, text: '' };
    wish.text = composeWish({ ...incoming, templateId: incoming.templateId, customMessage: '' });
    setState({ ...incoming, generated: true, shared: true, wish, customMessage: '' });
    void base;
  }

  const afterIntro = () => router.go(getState().shared ? 'gift' : 'studio');

  const intro = createIntro($('#screen-intro'), { onStart: afterIntro });
  const studio = createStudio($('#screen-studio'), { onContinue: () => router.go('gift') });
  const gift = createGiftScreen($('#screen-gift'), { onOpened: () => { if (router.current === 'gift') router.go('celebration'); } });
  const celebration = createCelebration($('#screen-celebration'), { onRangoli: () => router.go('rangoli'), onCard: () => router.go('card') });
  const rangoli = createRangoli($('#screen-rangoli'));
  const card = createCardStudio($('#screen-card'), { onNext: () => router.go('share') });
  const share = createShare($('#screen-share'), {
    onCard: () => router.go('card'),
    onRestart: () => {
      resetExperience();
      card.reset();
      studio.sync();
      router.go('intro');
    },
  });

  const needsWish = () => (getState().generated ? null : 'studio');
  const router = createRouter({
    screens: {
      intro: { enter: () => { intro.setNote(noteFor()); intro.enter(); }, leave: () => intro.leave() },
      studio: { enter: () => { studio.sync(); }, leave: () => {} },
      gift: { guard: needsWish, enter: () => gift.enter(), leave: () => gift.leave() },
      celebration: { guard: needsWish, enter: () => celebration.enter(), leave: () => celebration.leave() },
      rangoli: { enter: () => rangoli.redraw() },
      card: { guard: needsWish, enter: () => card.enter() },
      share: { guard: needsWish, enter: () => share.enter() },
    },
    onChange: (name) => { renderNav(name); $('#journey').hidden = name === 'intro'; },
  });

  function noteFor() {
    const s = getState();
    return s.shared ? `A Diwali wish is waiting${s.recipient ? ` for ${s.recipient}` : ''}${s.sender ? `, sent by ${s.sender}` : ''}.` : '';
  }

  // Journey navigation
  const nav = $('#journey');
  NAV.forEach(([id, label]) => {
    const b = el('button', { type: 'button', class: 'journey__btn', 'data-go': id, text: label });
    b.addEventListener('click', () => router.go(id));
    nav.append(b);
  });
  function renderNav(active) {
    const generated = getState().generated;
    $$('.journey__btn', nav).forEach((b) => {
      const id = b.dataset.go;
      const locked = NEEDS_WISH.has(id) && !generated;
      b.disabled = locked;
      b.title = locked ? 'Generate a wish first' : '';
      if (id === active) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
  }
  subscribe(() => renderNav(router.current));

  $('#gift-back').addEventListener('click', () => router.go('studio'));
  $('#rangoli-next').addEventListener('click', () => router.go(getState().generated ? 'card' : 'studio'));
  $('.brand').addEventListener('click', (e) => { e.preventDefault(); router.go('intro'); });

  initMusic();
  router.start();

  // Keep a little diagnostic hook for QA in the console.
  window.__diwali = { getState, router, toast };
}
