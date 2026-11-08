import gsap from 'gsap';
import { $, $$, prefersReducedMotion } from './utils/helpers.js';
import { SCREENS } from './utils/constants.js';

const TITLES = {
  intro: 'Welcome', studio: 'Create your wish', gift: 'Gift box', celebration: 'Celebration',
  rangoli: 'Rangoli studio', card: 'Greeting card studio', share: 'Share your wish',
};

/**
 * Hash router with a cinematic gold veil between screens.
 * screens: { name: { enter(), leave(), guard?() -> redirect name | null } }
 */
export function createRouter({ screens, onChange }) {
  const veil = $('#veil');
  const live = $('#live');
  let current = null;
  let busy = false;
  let pending = null;

  const sectionOf = (name) => $(`#screen-${name}`);
  const parse = () => {
    const name = (location.hash.replace(/^#\/?/, '') || 'intro').split(/[?&]/)[0];
    return SCREENS.includes(name) ? name : 'intro';
  };

  function show(name) {
    SCREENS.forEach((n) => {
      const sec = sectionOf(n);
      const on = n === name;
      sec.hidden = !on;
      if (on) sec.removeAttribute('inert'); else sec.setAttribute('inert', '');
    });
  }

  async function transition(name) {
    if (busy) { pending = name; return; }
    const redirect = screens[name]?.guard?.();
    if (redirect && redirect !== name) { go(redirect, { replace: true }); return; }
    if (name === current) return;
    busy = true;
    const reduced = prefersReducedMotion();
    const prev = current;
    if (!reduced && prev) await gsap.to(veil, { autoAlpha: 1, duration: 0.38, ease: 'power2.in' });
    if (prev) screens[prev]?.leave?.();
    current = name;
    show(name);
    window.scrollTo(0, 0);
    document.documentElement.dataset.screen = name;
    try { await screens[name]?.enter?.(); } catch (err) { console.error(err); }
    onChange?.(name, prev);
    live.textContent = `${TITLES[name]} screen`;
    const heading = $('[data-heading]', sectionOf(name));
    heading?.focus({ preventScroll: true });
    if (!reduced && prev) gsap.to(veil, { autoAlpha: 0, duration: 0.7, ease: 'power2.out' });
    else gsap.set(veil, { autoAlpha: 0 });
    busy = false;
    if (pending) { const p = pending; pending = null; if (p !== current) transition(p); }
  }

  function go(name, { replace = false } = {}) {
    const target = `#/${name}`;
    if (location.hash === target) { transition(name); return; }
    if (replace) history.replaceState(null, '', target);
    else location.hash = target;
    if (replace) transition(name);
  }

  window.addEventListener('hashchange', () => transition(parse()));
  gsap.set(veil, { autoAlpha: 0 });

  return {
    go,
    get current() { return current; },
    start() {
      const name = parse();
      if (location.hash !== `#/${name}`) history.replaceState(null, '', `#/${name}`);
      transition(name);
    },
  };
}
