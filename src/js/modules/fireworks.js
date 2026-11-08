import { createLoop, observeSize, cappedDpr, rand, pick, isSmallScreen, prefersReducedMotion } from '../utils/helpers.js';
import { FIREWORK_COLORS } from '../utils/constants.js';

/**
 * Canvas fireworks.
 * - Rockets rise to the tapped point and explode into particles.
 * - Particles have velocity, gravity, friction, lifespan and opacity decay.
 * - A hard particle cap keeps performance predictable.
 * - The render loop only runs while something is on screen.
 */
export function createFireworks(canvas, { onBurst } = {}) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  const rockets = [];
  const parts = [];
  const timeouts = new Set();
  const cap = () => (isSmallScreen() ? 420 : 800);
  const GRAVITY = 140;

  const resize = (cw, ch) => {
    const dpr = cappedDpr(isSmallScreen() ? 1.5 : 2);
    w = Math.max(1, cw);
    h = Math.max(1, ch);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const stopObserve = observeSize(canvas, resize);

  function explode(x, y, color) {
    const reduced = prefersReducedMotion();
    const baseCount = reduced ? 26 : isSmallScreen() ? 48 : 78;
    const room = cap() - parts.length;
    if (room <= 0) return;
    const count = Math.min(baseCount, room);
    const style = pick(['radial', 'ring', 'radial']);
    const palette = [color, pick(FIREWORK_COLORS), '#FFF8EB'];
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2 + rand(-0.05, 0.05);
      const speed = style === 'ring' ? rand(150, 170) : rand(40, 230);
      parts.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: rand(0.9, 1.7),
        max: 1.7,
        size: rand(1.2, 2.8),
        color: pick(palette),
      });
    }
    onBurst?.(x, y);
  }

  function launch(x, y, color = pick(FIREWORK_COLORS)) {
    if (!w) return;
    const tx = Math.min(Math.max(x, 20), w - 20);
    const ty = Math.min(Math.max(y, 30), h * 0.85);
    const dur = rand(0.45, 0.75);
    rockets.push({ x: tx + rand(-14, 14), y: h + 8, tx, ty, vy: -(h + 8 - ty) / dur, t: 0, dur, color });
    loop.start();
  }

  function frame(dt) {
    // Fade previous frame to create light trails on a transparent canvas.
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = rockets.length - 1; i >= 0; i -= 1) {
      const r = rockets[i];
      r.t += dt;
      r.y += r.vy * dt;
      r.x += (r.tx - r.x) * Math.min(1, dt * 4);
      ctx.beginPath();
      ctx.fillStyle = r.color;
      ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      if (r.y <= r.ty || r.t >= r.dur) {
        rockets.splice(i, 1);
        explode(r.x, r.y, r.color);
      }
    }

    for (let i = parts.length - 1; i >= 0; i -= 1) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0) {
        parts[i] = parts[parts.length - 1];
        parts.pop();
        continue;
      }
      p.vx *= 1 - 1.4 * dt;
      p.vy = p.vy * (1 - 1.4 * dt) + GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const alpha = Math.max(0, Math.min(1, p.life / p.max)) ** 1.4;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.5 + alpha * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!rockets.length && !parts.length) {
      // Nothing left: wipe the canvas and stop the loop until the next launch.
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);
      loop.stop();
    }
  }

  const loop = createLoop(frame);

  const later = (fn, ms) => {
    const id = window.setTimeout(() => { timeouts.delete(id); fn(); }, ms);
    timeouts.add(id);
  };

  function onPointer(e) {
    const rect = canvas.getBoundingClientRect();
    launch(e.clientX - rect.left, e.clientY - rect.top);
  }
  canvas.addEventListener('pointerdown', onPointer);

  return {
    launch,
    /** Launch a choreographed salvo (used by the celebration screen). */
    finale(count = 6) {
      const n = prefersReducedMotion() ? Math.min(2, count) : count;
      for (let i = 0; i < n; i += 1) {
        later(() => launch(rand(w * 0.12, w * 0.88), rand(h * 0.12, h * 0.5)), 180 + i * 320);
      }
    },
    clear() {
      timeouts.forEach((id) => clearTimeout(id));
      timeouts.clear();
      rockets.length = 0;
      parts.length = 0;
      loop.stop();
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);
    },
    pause: () => loop.stop(),
    resume: () => { if (rockets.length || parts.length) loop.start(); },
    get count() { return parts.length; },
    destroy() {
      this.clear();
      loop.destroy();
      stopObserve();
      canvas.removeEventListener('pointerdown', onPointer);
    },
  };
}
