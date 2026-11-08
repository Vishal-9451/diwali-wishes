import { $, $$, el, observeSize, cappedDpr, canvasToBlob, downloadBlob, toast, clamp } from '../utils/helpers.js';
import { RANGOLI_COLORS } from '../utils/constants.js';

const TAU = Math.PI * 2;

/* ---------- symmetry ---------- */
const SYMMETRY = {
  off: [(x, y) => [x, y]],
  mirror: [(x, y) => [x, y], (x, y) => [-x, y]],
  r4: rotations(4, false),
  r6: rotations(6, true),
  r8: rotations(8, true),
  r12: rotations(12, true),
};
function rotations(n, mirror) {
  const list = [];
  for (let k = 0; k < n; k += 1) {
    const a = (k / n) * TAU;
    const c = Math.cos(a);
    const s = Math.sin(a);
    list.push((x, y) => [x * c - y * s, x * s + y * c]);
    if (mirror) list.push((x, y) => [-(x * c - y * s), x * s + y * c]);
  }
  return list;
}

/* ---------- presets (normalised 0..1 coordinates) ---------- */
const P = (cx, cy, r, a) => [0.5 + (cx + Math.cos(a) * r), 0.5 + (cy + Math.sin(a) * r)];
function petal(angle, inner, outer, width) {
  const pts = [];
  const steps = 18;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const r = inner + (outer - inner) * Math.sin(t * Math.PI * 0.5) ;
    const wdt = Math.sin(t * Math.PI) * width * (1 - t * 0.35);
    pts.push(P(0, 0, r, angle).map((v, idx) => v + (idx === 0 ? -Math.sin(angle) : Math.cos(angle)) * wdt));
  }
  for (let i = steps; i >= 0; i -= 1) {
    const t = i / steps;
    const r = inner + (outer - inner) * Math.sin(t * Math.PI * 0.5);
    const wdt = Math.sin(t * Math.PI) * width * (1 - t * 0.35);
    pts.push(P(0, 0, r, angle).map((v, idx) => v + (idx === 0 ? Math.sin(angle) : -Math.cos(angle)) * wdt));
  }
  return pts;
}
const circle = (r, n = 72, cx = 0, cy = 0) => Array.from({ length: n + 1 }, (_, i) => P(cx, cy, r, (i / n) * TAU));
const dot = (x, y) => [[x, y]];

const PRESETS = {
  lotus() {
    const s = [];
    const layers = [
      { n: 16, inner: 0.1, outer: 0.44, w: 0.045, color: '#D6336C' },
      { n: 12, inner: 0.08, outer: 0.34, w: 0.05, color: '#F08A24' },
      { n: 8, inner: 0.05, outer: 0.22, w: 0.045, color: '#F5CC75' },
    ];
    layers.forEach((l, li) => {
      for (let i = 0; i < l.n; i += 1) s.push({ pts: petal((i / l.n) * TAU + li * 0.2, l.inner, l.outer, l.w), color: l.color, size: 0.006 });
    });
    s.push({ pts: circle(0.04, 24), color: '#FFF8EB', size: 0.01 });
    s.push({ pts: circle(0.47, 96), color: '#D6A84D', size: 0.005 });
    return s;
  },
  star() {
    const s = [];
    const tri = (rot, color) => {
      const pts = [0, 1, 2, 0].map((i) => P(0, 0, 0.42, rot + (i / 3) * TAU));
      s.push({ pts, color, size: 0.007 });
    };
    tri(-Math.PI / 2, '#F5CC75');
    tri(Math.PI / 2, '#1FA6A0');
    [0.46, 0.34, 0.2].forEach((r, i) => s.push({ pts: circle(r, 96), color: ['#D6A84D', '#C7B9D7', '#FFF8EB'][i], size: 0.004 }));
    for (let i = 0; i < 24; i += 1) s.push({ pts: dot(...P(0, 0, 0.49, (i / 24) * TAU)), color: '#F08A24', size: 0.014 });
    s.push({ pts: dot(0.5, 0.5), color: '#D6336C', size: 0.03 });
    return s;
  },
  kolam() {
    const s = [];
    const n = 4;
    for (let y = -n; y <= n; y += 1) {
      const span = n - Math.abs(y);
      for (let x = -span; x <= span; x += 1) {
        s.push({ pts: dot(0.5 + x * 0.085, 0.5 + y * 0.085), color: '#FFF8EB', size: 0.014 });
      }
    }
    for (let k = 0; k < 4; k += 1) {
      const a = (k / 4) * TAU + Math.PI / 4;
      s.push({ pts: circle(0.1, 40, Math.cos(a) * 0.18, Math.sin(a) * 0.18), color: ['#D6336C', '#F08A24', '#1FA6A0', '#F5CC75'][k], size: 0.006 });
    }
    s.push({ pts: circle(0.45, 96), color: '#D6A84D', size: 0.005 });
    s.push({ pts: circle(0.4, 96), color: '#C7B9D7', size: 0.003 });
    return s;
  },
  diyas() {
    const s = [];
    const n = 12;
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * TAU;
      const [x, y] = P(0, 0, 0.36, a);
      const bowl = Array.from({ length: 13 }, (_, j) => {
        const t = (j / 12) * Math.PI;
        const px = Math.cos(t) * 0.04;
        const py = Math.sin(t) * 0.028;
        return rot2([px, py], a + Math.PI / 2, x, y);
      });
      s.push({ pts: bowl, color: '#D6A84D', size: 0.007 });
      const fl = [rot2([0, -0.004], a + Math.PI / 2, x, y), rot2([0.012, -0.03], a + Math.PI / 2, x, y), rot2([0, -0.052], a + Math.PI / 2, x, y), rot2([-0.012, -0.03], a + Math.PI / 2, x, y), rot2([0, -0.004], a + Math.PI / 2, x, y)];
      s.push({ pts: fl, color: '#F5CC75', size: 0.005 });
    }
    for (let i = 0; i < 8; i += 1) s.push({ pts: petal((i / 8) * TAU, 0.04, 0.22, 0.05), color: i % 2 ? '#D6336C' : '#F08A24', size: 0.006 });
    s.push({ pts: circle(0.29, 90), color: '#C7B9D7', size: 0.003 });
    return s;
  },
};
function rot2([px, py], a, x, y) {
  // px,py are in a local frame whose +y points toward the centre of the ring (rotated by a)
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x + px * c - py * s, y + px * s + py * c];
}

/* ---------- editor ---------- */
export function createRangoli(root) {
  const canvas = $('#rangoli-canvas', root);
  const ctx = canvas.getContext('2d');
  const sizeInput = $('#rangoli-size', root);
  const sizeOut = $('#rangoli-size-out', root);
  const symSel = $('#rangoli-symmetry', root);
  const colorHost = $('#rangoli-colors', root);
  const undoBtn = $('#rangoli-undo', root);
  const clearBtn = $('#rangoli-clear', root);
  const dlBtn = $('#rangoli-download', root);
  const presetBtns = $$('[data-preset]', root);
  const hint = $('#rangoli-hint', root);

  let css = 300;
  let dpr = 1;
  let color = RANGOLI_COLORS[0].value;
  const history = []; // { type: 'stroke'|'preset'|'clear', ... }
  let current = null;
  let activePointer = null;
  const cleanups = [];

  /* colours */
  RANGOLI_COLORS.forEach((c, i) => {
    const id = `rc-${c.id}`;
    const input = el('input', { type: 'radio', name: 'rangoli-color', id, value: c.value, class: 'swatch__input' });
    if (i === 0) input.checked = true;
    const label = el('label', { for: id, class: 'swatch', title: c.label }, [el('span', { class: 'sr-only', text: c.label })]);
    label.style.setProperty('--sw', c.value);
    input.addEventListener('change', () => { color = c.value; });
    colorHost.append(input, label);
  });

  /* rendering */
  function paintBackground(c, size) {
    const g = c.createRadialGradient(size / 2, size / 2, size * 0.05, size / 2, size / 2, size * 0.75);
    g.addColorStop(0, '#291542');
    g.addColorStop(1, '#160D2C');
    c.fillStyle = g;
    c.fillRect(0, 0, size, size);
    c.save();
    c.strokeStyle = 'rgba(199,185,215,0.10)';
    c.lineWidth = Math.max(1, size / 600);
    [0.12, 0.24, 0.36, 0.48].forEach((r) => { c.beginPath(); c.arc(size / 2, size / 2, r * size, 0, TAU); c.stroke(); });
    c.beginPath();
    c.moveTo(size / 2, 0); c.lineTo(size / 2, size);
    c.moveTo(0, size / 2); c.lineTo(size, size / 2);
    c.stroke();
    c.restore();
  }

  function drawStroke(c, stroke, size, sym, from = 0) {
    const fns = SYMMETRY[sym] || SYMMETRY.off;
    const pts = stroke.pts;
    c.save();
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.strokeStyle = stroke.color;
    c.fillStyle = stroke.color;
    c.lineWidth = Math.max(1, stroke.size * size);
    c.shadowColor = stroke.color;
    c.shadowBlur = size * 0.012;
    for (const fn of fns) {
      const map = ([x, y]) => {
        const [tx, ty] = fn((x - 0.5) * size, (y - 0.5) * size);
        return [tx + size / 2, ty + size / 2];
      };
      if (pts.length === 1) {
        const [x, y] = map(pts[0]);
        c.beginPath();
        c.arc(x, y, c.lineWidth / 2, 0, TAU);
        c.fill();
        continue;
      }
      c.beginPath();
      const start = Math.max(0, from - 1);
      const [sx, sy] = map(pts[start]);
      c.moveTo(sx, sy);
      for (let i = start + 1; i < pts.length; i += 1) {
        const [x, y] = map(pts[i]);
        c.lineTo(x, y);
      }
      c.stroke();
    }
    c.restore();
  }

  function renderAll(c, size) {
    paintBackground(c, size);
    let startIdx = 0;
    for (let i = history.length - 1; i >= 0; i -= 1) if (history[i].type === 'clear') { startIdx = i + 1; break; }
    for (let i = startIdx; i < history.length; i += 1) {
      const item = history[i];
      if (item.type === 'stroke') drawStroke(c, item, size, item.sym);
      else if (item.type === 'preset') item.strokes.forEach((s) => drawStroke(c, s, size, 'off'));
    }
  }

  const redraw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderAll(ctx, css);
    updateButtons();
  };

  function hasArt() {
    for (let i = history.length - 1; i >= 0; i -= 1) {
      if (history[i].type === 'clear') return false;
      if (history[i].type !== 'clear') return true;
    }
    return false;
  }
  function updateButtons() {
    undoBtn.disabled = history.length === 0;
    clearBtn.disabled = !hasArt();
    if (hint) hint.hidden = hasArt();
  }

  /* sizing */
  cleanups.push(observeSize(canvas.parentElement, (w) => {
    if (!w) return;
    css = Math.floor(w);
    dpr = cappedDpr(2);
    canvas.style.height = `${css}px`;
    canvas.width = Math.round(css * dpr);
    canvas.height = Math.round(css * dpr);
    redraw();
  }));

  /* pointer drawing (mouse, touch and pen) */
  const toNorm = (e) => {
    const r = canvas.getBoundingClientRect();
    return [clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1)];
  };
  const brush = () => (Number(sizeInput.value) || 6) / 400;

  function onDown(e) {
    if (activePointer !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
    activePointer = e.pointerId;
    canvas.setPointerCapture?.(e.pointerId);
    current = { type: 'stroke', pts: [toNorm(e)], color, size: brush(), sym: symSel.value };
    drawStroke(ctx, current, css, current.sym);
    e.preventDefault();
  }
  function onMove(e) {
    if (e.pointerId !== activePointer || !current) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    const before = current.pts.length;
    for (const ev of events.length ? events : [e]) {
      const p = toNorm(ev);
      const last = current.pts[current.pts.length - 1];
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 0.002) current.pts.push(p);
    }
    if (current.pts.length > before) drawStroke(ctx, current, css, current.sym, before);
  }
  function onUp(e) {
    if (e.pointerId !== activePointer) return;
    activePointer = null;
    if (current) { history.push(current); current = null; }
    updateButtons();
  }
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  /* keyboard drawing: arrow keys move a virtual cursor so the canvas is usable without a pointer */
  let kb = { x: 0.5, y: 0.5, down: false };
  canvas.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 0.04 : 0.015;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      kb.x = clamp(kb.x + moves[e.key][0], 0, 1);
      kb.y = clamp(kb.y + moves[e.key][1], 0, 1);
      if (kb.down && current) { current.pts.push([kb.x, kb.y]); drawStroke(ctx, current, css, current.sym, current.pts.length - 1); }
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!kb.down) { kb.down = true; current = { type: 'stroke', pts: [[kb.x, kb.y]], color, size: brush(), sym: symSel.value }; drawStroke(ctx, current, css, current.sym); }
      else { kb.down = false; if (current) history.push(current); current = null; updateButtons(); }
    }
  });

  /* controls */
  sizeInput.addEventListener('input', () => { sizeOut.textContent = `${sizeInput.value}px`; });
  sizeOut.textContent = `${sizeInput.value}px`;
  undoBtn.addEventListener('click', () => { if (history.length) { history.pop(); redraw(); } });
  clearBtn.addEventListener('click', () => { if (hasArt()) { history.push({ type: 'clear' }); redraw(); toast('Canvas cleared. Press Undo to bring it back.'); } });
  presetBtns.forEach((b) => b.addEventListener('click', () => {
    const make = PRESETS[b.dataset.preset];
    if (!make) return;
    history.push({ type: 'preset', strokes: make() });
    redraw();
  }));
  dlBtn.addEventListener('click', async () => {
    if (!hasArt()) { toast('Draw something or add a preset first.', 'error'); return; }
    try {
      const out = document.createElement('canvas');
      out.width = out.height = 2048;
      const c = out.getContext('2d');
      renderAll(c, 2048);
      const blob = await canvasToBlob(out, 'image/png');
      downloadBlob(blob, 'diwali-rangoli.png');
      toast('Rangoli saved as PNG.');
    } catch (err) {
      toast(`Could not export the rangoli: ${err.message}`, 'error');
    }
  });

  updateButtons();

  return {
    redraw,
    undo: () => undoBtn.click(),
    get strokeCount() { return history.filter((h) => h.type !== 'clear').length; },
    destroy() {
      cleanups.forEach((fn) => fn());
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    },
  };
}
