import gsap from 'gsap';
import { $, el, hasWebGL, prefersReducedMotion } from '../utils/helpers.js';
import { makeDiya, makeRangoli } from '../utils/decor.js';
import { createFireworks } from './fireworks.js';
import { createAmbient } from './ambient.js';
import { playFireworkSfx } from './music.js';
import { getState } from '../state.js';
import { getCategory } from '../data/wishes.js';

export function createCelebration(root, { onRangoli, onCard }) {
  const title = $('#cel-title', root);
  const toEl = $('#cel-to', root);
  const wishEl = $('#cel-wish', root);
  const fwCanvas = $('#fireworks-canvas', root);
  const ambCanvas = $('#ambient-cel', root);
  const diyaCanvas = $('#diya-canvas', root);
  const diyaFallback = $('#diya-fallback', root);
  const rangoliHost = $('#cel-rangoli', root);

  let fireworks = null;
  let ambient = null;
  let stage = null;
  let tl = null;
  let token = 0;
  let titleBuilt = false;

  rangoliHost.append(makeRangoli({ rings: 3, petals: 10, className: 'cel__rangoli-svg' }));

  function buildTitle() {
    if (titleBuilt) return;
    titleBuilt = true;
    const text = title.textContent;
    title.setAttribute('aria-label', text);
    title.replaceChildren(...[...text].map((ch) => el('span', { class: 'ch', 'aria-hidden': 'true', text: ch === ' ' ? '\u00A0' : ch })));
  }

  async function buildDiya(my) {
    if (!hasWebGL()) return showFallbackDiya();
    try {
      const [{ createStage }, { createDiyaModel }, { createGoldDust }] = await Promise.all([
        import('../three/scene.js'), import('../three/diya-model.js'), import('../three/particles.js'),
      ]);
      if (my !== token) return;
      const st = createStage(diyaCanvas, {
        shadows: false, environment: true, lights: true, maxDpr: 1.5,
        camera: { distance: 7.6, height: 3.4, lookY: 0.7, fov: 36 },
        onContextLost: showFallbackDiya,
      });
      const diya = createDiyaModel();
      diya.group.position.x = -0.1;
      const dust = createGoldDust({ count: 28, radius: 2.2, height: 3 });
      st.scene.add(diya.group, dust.points);
      st.onFrame((dt, t) => {
        diya.update(t);
        dust.update(dt, t);
        if (!prefersReducedMotion()) diya.group.rotation.y = Math.sin(t * 0.5) * 0.5 - 0.3;
      });
      stage = st;
      diyaCanvas.hidden = false;
      diyaFallback.hidden = true;
      st.start();
    } catch (err) {
      console.warn('3D diya unavailable, using SVG:', err);
      showFallbackDiya();
    }
  }

  function showFallbackDiya() {
    stage?.dispose();
    stage = null;
    diyaCanvas.hidden = true;
    diyaFallback.hidden = false;
    if (!diyaFallback.firstChild) diyaFallback.append(makeDiya());
  }

  function animateIn() {
    tl?.kill();
    const reduced = prefersReducedMotion();
    const chars = title.querySelectorAll('.ch');
    if (reduced) { gsap.set([chars, toEl, wishEl.parentElement, '.cel__diya'], { clearProps: 'all' }); return; }
    tl = gsap.timeline();
    tl.fromTo('.cel__diya', { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 1, ease: 'back.out(1.5)' })
      .fromTo(chars, { autoAlpha: 0, y: 30, rotateX: -60 }, { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out' }, '-=0.5')
      .fromTo(toEl, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.2')
      .fromTo(wishEl.parentElement, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7 }, '-=0.3');
  }

  function fill() {
    const s = getState();
    const cat = getCategory(s.relationship);
    toEl.textContent = `For ${s.recipient || cat.fallback[s.language]}${s.sender ? `, with love from ${s.sender}` : ''}`;
    wishEl.textContent = s.wish.text;
    wishEl.setAttribute('lang', s.language === 'hi' ? 'hi' : 'en');
  }

  async function enter() {
    const my = ++token;
    buildTitle();
    fill();
    if (!fireworks) fireworks = createFireworks(fwCanvas, { onBurst: () => playFireworkSfx() });
    if (!ambient) ambient = createAmbient(ambCanvas, { density: 0.8 });
    ambient.start();
    animateIn();
    buildDiya(my);
    // The gift opening was a user gesture, so launching a finale here is allowed.
    fireworks.finale(6);
  }

  function leave() {
    token += 1;
    tl?.kill();
    fireworks?.clear();
    ambient?.stop();
    stage?.dispose();
    stage = null;
  }

  $('#cel-fireworks', root).addEventListener('click', () => {
    const r = fwCanvas.getBoundingClientRect();
    for (let i = 0; i < 3; i += 1) setTimeout(() => fireworks?.launch(r.width * (0.2 + Math.random() * 0.6), r.height * (0.12 + Math.random() * 0.35)), i * 220);
  });
  $('#cel-replay', root).addEventListener('click', () => {
    fireworks?.clear();
    animateIn();
    fireworks?.finale(6);
  });
  $('#cel-rangoli-btn', root).addEventListener('click', () => onRangoli?.());
  $('#cel-card', root).addEventListener('click', () => onCard?.());

  return { enter, leave };
}
