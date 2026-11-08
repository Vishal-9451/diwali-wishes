import gsap from 'gsap';
import { $, el, svgEl, hasWebGL, prefersReducedMotion, rand } from '../utils/helpers.js';
import { getState } from '../state.js';
import { playGiftSfx } from './music.js';

import { getCategory } from '../data/wishes.js';


/**
 * Interactive gift screen. Uses a real Three.js scene (lazy-loaded), and a
 * GSAP-animated SVG gift when WebGL is unavailable.
 */
export function createGiftScreen(root, { onOpened }) {
  const stageEl = $('#gift-stage', root);
  const canvas = $('#gift-canvas', root);
  const fallback = $('#gift-fallback', root);
  const reveal = $('#gift-reveal', root);
  const revealTo = $('#gift-reveal-to', root);
  const openBtn = $('#gift-open', root);
  const contBtn = $('#gift-continue', root);

  let stage = null;
  let model = null;
  let dust = null;
  let burst = null;
  let tl = null;
  let delayed = null;
  let opened = false;
  let using2d = false;
  let drag = null;
  let token = 0;
  let spin = 0;
  let velocity = 0;
  const cleanups = [];

  const forced2d = new URLSearchParams(location.search).get('renderer') === '2d';

  async function enter() {
    const my = ++token;
    opened = false;
    reveal.hidden = true;
    contBtn.hidden = true;
    openBtn.hidden = false;
    openBtn.disabled = false;
    gsap.set(reveal, { clearProps: 'all' });
    using2d = forced2d || !hasWebGL();
    if (!using2d) {
      try {
        await build3d();
      } catch (err) {
        console.warn('WebGL gift unavailable, using 2D fallback:', err);
        teardown3d();
        using2d = true;
      }
    }
    if (my !== token) { teardown3d(); return; }
    canvas.hidden = !using2d ? false : true;
    fallback.hidden = !using2d;
    if (using2d) build2d();
    else stage.start();
  }

  async function build3d() {
    const [{ createStage }, { createGiftModel }, { createGoldDust, createBurst }] = await Promise.all([
      import('../three/scene.js'),
      import('../three/gift-model.js'),
      import('../three/particles.js'),
    ]);
    stage = createStage(canvas, {
      camera: { distance: 9.2, height: 3.1, lookY: 1 },
      onContextLost: () => { using2d = true; teardown3d(); canvas.hidden = true; fallback.hidden = false; build2d(); },
    });
    model = createGiftModel();
    dust = createGoldDust({ count: window.innerWidth < 640 ? 50 : 90 });
    burst = createBurst({ max: 200 });
    stage.scene.add(model.floor, model.halo, model.group, dust.points, burst.points);

    const reduced = prefersReducedMotion();
    stage.onFrame((dt, t) => {
      if (!drag && !opened && !reduced) {
        model.group.rotation.y += (0.35 + velocity) * dt;
        model.group.position.y = Math.sin(t * 1.4) * 0.05;
      } else if (drag === null) {
        model.group.rotation.y += velocity * dt;
      }
      velocity *= 1 - Math.min(1, dt * 2.2);
      dust.update(dt, t);
      burst.update(dt);
    });

    // Mouse + touch drag to rotate; a short tap opens the gift.
    let moved = 0;
    const down = (e) => {
      drag = { x: e.clientX, id: e.pointerId };
      moved = 0;
      canvas.setPointerCapture?.(e.pointerId);
    };
    const move = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      drag.x = e.clientX;
      moved += Math.abs(dx);
      model.group.rotation.y += dx * 0.012;
      velocity = dx * 0.5;
    };
    const up = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      if (moved < 6 && !opened) open();
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    cleanups.push(() => {
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
    });
  }

  function build2d() {
    fallback.replaceChildren();
    const svg = svgEl('svg', { viewBox: '0 0 300 300', class: 'gift2d', role: 'img', 'aria-label': 'A gold-ribboned gift box' });
    const defs = svgEl('defs');
    const g1 = svgEl('linearGradient', { id: 'g2d-body', x1: 0, y1: 0, x2: 0, y2: 1 });
    g1.append(svgEl('stop', { offset: 0, 'stop-color': '#5a2c99' }), svgEl('stop', { offset: 1, 'stop-color': '#34185c' }));
    const g2 = svgEl('linearGradient', { id: 'g2d-gold', x1: 0, y1: 0, x2: 1, y2: 1 });
    g2.append(svgEl('stop', { offset: 0, 'stop-color': '#F5CC75' }), svgEl('stop', { offset: 1, 'stop-color': '#B98A2E' }));
    defs.append(g1, g2);
    const glow = svgEl('ellipse', { cx: 150, cy: 120, rx: 70, ry: 90, fill: '#F5CC75', opacity: 0, class: 'gift2d__glow' });
    const body = svgEl('g');
    body.append(
      svgEl('rect', { x: 60, y: 140, width: 180, height: 120, rx: 6, fill: 'url(#g2d-body)' }),
      svgEl('rect', { x: 136, y: 140, width: 28, height: 120, fill: 'url(#g2d-gold)' })
    );
    const lid = svgEl('g', { class: 'gift2d__lid' });
    lid.append(
      svgEl('rect', { x: 50, y: 108, width: 200, height: 38, rx: 6, fill: '#6a35b0' }),
      svgEl('rect', { x: 136, y: 108, width: 28, height: 38, fill: 'url(#g2d-gold)' }),
      svgEl('path', { d: 'M150 108c-14-34-52-30-42-8 6 12 30 10 42 8zM150 108c14-34 52-30 42-8-6 12-30 10-42 8z', fill: 'url(#g2d-gold)' }),
      svgEl('circle', { cx: 150, cy: 106, r: 9, fill: '#D6A84D' })
    );
    svg.append(defs, glow, body, lid);
    fallback.append(svg);
    cleanups.push(() => fallback.replaceChildren());
    fallback.onclick = () => { if (!opened) open(); };
  }

  function teardown3d() {
    cleanups.splice(0).forEach((fn) => fn());
    stage?.dispose();
    stage = model = dust = burst = null;
  }

  async function open() {
    if (opened) return;
    opened = true;
    openBtn.disabled = true;
    playGiftSfx();
    const reduced = prefersReducedMotion();
    const k = reduced ? 0.01 : 1;
    tl?.kill();
    tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (!using2d && model) {
      const g = model.group;
      const target = Math.round(g.rotation.y / (Math.PI * 2)) * Math.PI * 2;
      velocity = 0;
      tl.to(g.rotation, { y: target, duration: 0.6 * k, ease: 'power3.inOut' })
        .to(g.scale, { x: 1.06, y: 0.92, z: 1.06, duration: 0.14 * k, yoyo: true, repeat: 1 }, '<')
        .to(model.lid.rotation, { x: -1.75, duration: 1.1 * k, ease: 'power3.out' }, '>-0.05')
        .to(model.lid.position, { y: model.bodyH + 0.35, z: -1.5, duration: 1.1 * k }, '<')
        .to(model.glowMat, { opacity: 0.95, duration: 0.9 * k }, '<0.1')
        .to(model.beamMat, { opacity: 0.16, duration: 1 * k }, '<')
        .to(model.innerLight, { intensity: 14, duration: 0.9 * k }, '<')
        .call(() => burst?.emit({ x: 0, y: model.bodyH + 0.3, z: 0 }, window.innerWidth < 640 ? 100 : 170, 3.4), null, '<0.2')
        .to(stage.camera.position, { z: stage.camera.position.z * 0.88, y: stage.camera.position.y + 0.3, duration: 1.2 * k, ease: 'power1.inOut' }, '<');
    } else {
      const lid = fallback.querySelector('.gift2d__lid');
      const glow = fallback.querySelector('.gift2d__glow');
      tl.to(lid, { y: -70, rotation: -18, transformOrigin: '50% 100%', duration: 0.9 * k, ease: 'back.out(1.6)' })
        .to(glow, { opacity: 0.6, duration: 0.7 * k }, '<');
      if (!reduced) {
        for (let i = 0; i < 26; i += 1) {
          const spark = el('span', { class: 'spark' });
          spark.style.left = '50%';
          spark.style.top = '40%';
          fallback.append(spark);
          tl.to(spark, { x: rand(-140, 140), y: rand(-190, -20), opacity: 0, scale: rand(0.5, 1.6), duration: rand(0.9, 1.6), ease: 'power2.out', onComplete: () => spark.remove() }, '<0.02');
        }
      }
    }

    const s = getState();
    const cat = getCategory(s.relationship);
    revealTo.textContent = s.recipient || cat.fallback[s.language] || '';
    reveal.hidden = false;
    tl.fromTo(reveal, { autoAlpha: 0, y: 24, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 * k }, '>-0.3');
    tl.call(() => { contBtn.hidden = false; openBtn.hidden = true; contBtn.focus({ preventScroll: true }); });
    delayed = window.setTimeout(() => onOpened?.(), reduced ? 400 : 3600);
  }

  function leave() {
    token += 1;
    tl?.kill();
    clearTimeout(delayed);
    tl = null;
    delayed = null;
    teardown3d();
    fallback.replaceChildren();
    fallback.onclick = null;
  }

  openBtn.addEventListener('click', open);
  contBtn.addEventListener('click', () => { clearTimeout(delayed); onOpened?.(); });

  return { enter, leave, open };
}
