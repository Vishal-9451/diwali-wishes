import { createLoop, cappedDpr, observeSize, prefersReducedMotion, rand, isSmallScreen } from '../utils/helpers.js';

/** Floating golden dust on a 2D canvas. Capped particle count, pauses with the tab. */
export function createAmbient(canvas, { density = 1 } = {}) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let dpr = 1;
  let parts = [];

  const make = () => ({
    x: rand(0, w), y: rand(0, h), r: rand(0.6, 2.2), vy: rand(6, 22), vx: rand(-6, 6),
    phase: rand(0, 6.28), tw: rand(0.8, 2.4), a: rand(0.25, 0.85),
  });

  const resize = (cw, ch) => {
    dpr = cappedDpr(2);
    w = Math.max(1, cw);
    h = Math.max(1, ch);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((isSmallScreen() ? 26 : 56) * density);
    parts = Array.from({ length: count }, make);
    if (!loop.running) draw(0);
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      const a = p.a * (0.55 + 0.45 * Math.sin(t * p.tw + p.phase));
      ctx.beginPath();
      ctx.fillStyle = `rgba(245,204,117,${a.toFixed(3)})`;
      ctx.shadowColor = 'rgba(245,204,117,0.8)';
      ctx.shadowBlur = 8;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  };

  const loop = createLoop((dt, t) => {
    for (const p of parts) {
      p.y -= p.vy * dt;
      p.x += p.vx * dt + Math.sin(t + p.phase) * 4 * dt;
      if (p.y < -10) { p.y = h + 10; p.x = rand(0, w); }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
    }
    draw(t);
  });

  const stopObserve = observeSize(canvas.parentElement || canvas, resize);

  return {
    start() { if (!prefersReducedMotion()) loop.start(); else draw(0); },
    stop() { loop.stop(); },
    destroy() { loop.destroy(); stopObserve(); },
  };
}
