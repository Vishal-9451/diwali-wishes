import gsap from 'gsap';
import { $, el, prefersReducedMotion } from '../utils/helpers.js';
import { makeDiya, makeRangoli } from '../utils/decor.js';
import { createAmbient } from './ambient.js';

export function createIntro(root, { onStart }) {
  const title = $('#intro-title', root);
  const tagline = $('#intro-tagline', root);
  const loaderBar = $('#intro-loader', root);
  const loaderText = $('#intro-loader-text', root);
  const loaderWrap = $('#intro-loader-wrap', root);
  const startBtn = $('#intro-start', root);
  const skipBtn = $('#intro-skip', root);
  const diyaHost = $('#intro-diyas', root);
  const rangoliHost = $('#intro-rangoli', root);

  let tl = null;
  let ready = false;
  let built = false;
  const ambient = createAmbient($('#ambient-intro', root));

  function build() {
    if (built) return;
    built = true;
    const text = title.textContent;
    title.setAttribute('aria-label', text);
    title.replaceChildren(...[...text].map((ch) => el('span', { class: 'ch', 'aria-hidden': 'true', text: ch === ' ' ? '\u00A0' : ch })));
    rangoliHost.append(makeRangoli({ rings: 5, petals: 12 }));
    [0.75, 1, 0.75].forEach((s) => {
      const wrap = el('div', { class: 'intro__diya' });
      wrap.style.setProperty('--s', s);
      wrap.append(makeDiya());
      diyaHost.append(wrap);
    });
  }

  const setProgress = (p, label) => {
    const v = Math.round(p * 100);
    loaderBar.style.setProperty('--p', `${v}%`);
    loaderBar.setAttribute('aria-valuenow', String(v));
    if (label) loaderText.textContent = label;
  };

  /** Real loading: fonts, then the lazily loaded 3D engine is prefetched. */
  async function load() {
    const tasks = [
      [document.fonts ? document.fonts.ready : Promise.resolve(), 'Polishing the brass…'],
      [import('../three/scene.js').catch(() => null), 'Warming the 3D scene…'],
    ];
    let done = 0;
    setProgress(0.05, 'Lighting the diyas…');
    const minDelay = prefersReducedMotion() ? 0 : 1400;
    const t0 = performance.now();
    await Promise.all(tasks.map(async ([p, label]) => {
      try { await p; } catch { /* non-fatal */ }
      done += 1;
      setProgress(0.1 + (done / tasks.length) * 0.8, label);
    }));
    const wait = Math.max(0, minDelay - (performance.now() - t0));
    await new Promise((r) => setTimeout(r, wait));
    setProgress(1, 'Ready');
    ready = true;
    startBtn.disabled = false;
    gsap.to(loaderWrap, { autoAlpha: 0, duration: prefersReducedMotion() ? 0 : 0.5, delay: 0.3, onComplete: () => { loaderWrap.hidden = true; } });
  }

  function play() {
    tl?.kill();
    const chars = title.querySelectorAll('.ch');
    const diyas = diyaHost.children;
    if (prefersReducedMotion()) { gsap.set([chars, tagline, diyas, rangoliHost], { clearProps: 'all' }); return; }
    tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(rangoliHost, { autoAlpha: 0, scale: 0.6, rotate: -40 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 2.2, ease: 'power2.out' })
      .fromTo(diyas, { autoAlpha: 0, y: 40, scale: 0.6 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1, stagger: 0.18, ease: 'back.out(1.6)' }, 0.4)
      .fromTo(chars, { autoAlpha: 0, y: 36, rotateX: -70 }, { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.06 }, 0.9)
      .fromTo(tagline, { autoAlpha: 0, y: 14, letterSpacing: '0.4em' }, { autoAlpha: 1, y: 0, letterSpacing: '0.12em', duration: 1.2 }, '-=0.3');
  }

  function skip() {
    tl?.progress(1).kill();
    gsap.set([title.querySelectorAll('.ch'), tagline, diyaHost.children, rangoliHost], { autoAlpha: 1, clearProps: 'transform' });
    onStart?.();
  }

  startBtn.addEventListener('click', () => { if (ready) onStart?.(); });
  skipBtn.addEventListener('click', skip);

  return {
    setNote(msg) {
      const note = $('#intro-note', root);
      note.hidden = !msg;
      note.textContent = msg || '';
    },
    enter() {
      build();
      ambient.start();
      play();
      if (!ready) load();
    },
    leave() { ambient.stop(); tl?.pause(); },
  };
}
