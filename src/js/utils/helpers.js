/* Small shared helpers: DOM, motion, loops, toasts, downloads. */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Create an element safely. Text is always assigned via textContent. */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of [].concat(children)) {
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function svgEl(tag, attrs = {}, children = []) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  for (const c of [].concat(children)) node.append(c);
  return node;
}

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const rand = (min, max) => min + Math.random() * (max - min);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const motionQuery = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;
export const prefersReducedMotion = () => Boolean(motionQuery && motionQuery.matches);
export const onMotionChange = (fn) => {
  if (!motionQuery) return () => {};
  const handler = () => fn(motionQuery.matches);
  motionQuery.addEventListener?.('change', handler);
  return () => motionQuery.removeEventListener?.('change', handler);
};

export const isCoarsePointer = () => Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
export const isSmallScreen = () => window.innerWidth < 640;

/** Device pixel ratio capped to keep canvases cheap on high density screens. */
export const cappedDpr = (max = 2) => Math.min(window.devicePixelRatio || 1, max);

/**
 * requestAnimationFrame loop that pauses automatically while the tab is hidden.
 * `fn(dt, now)` receives the delta time in seconds (clamped to 50ms).
 */
export function createLoop(fn) {
  let id = 0;
  let running = false;
  let last = 0;

  const frame = (now) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    fn(dt, now / 1000);
    id = requestAnimationFrame(frame);
  };
  const begin = () => {
    if (id || document.hidden) return;
    last = performance.now();
    id = requestAnimationFrame(frame);
  };
  const halt = () => {
    if (id) cancelAnimationFrame(id);
    id = 0;
  };
  const onVisibility = () => {
    if (!running) return;
    if (document.hidden) halt();
    else begin();
  };
  document.addEventListener('visibilitychange', onVisibility);

  return {
    start() {
      running = true;
      begin();
    },
    stop() {
      running = false;
      halt();
    },
    get running() {
      return running;
    },
    destroy() {
      running = false;
      halt();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}

/** Observe element size changes. Returns a disposer. */
export function observeSize(target, cb) {
  if (typeof ResizeObserver === 'undefined') {
    const handler = () => cb(target.clientWidth, target.clientHeight);
    window.addEventListener('resize', handler);
    handler();
    return () => window.removeEventListener('resize', handler);
  }
  const ro = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    cb(width, height);
  });
  ro.observe(target);
  return () => ro.disconnect();
}

/* ---------- Toasts ---------- */
let toastTimer = 0;
export function toast(message, kind = 'info') {
  const host = document.getElementById('toast');
  if (!host) return;
  host.textContent = message;
  host.dataset.kind = kind;
  host.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => host.classList.remove('is-visible'), 3200);
}

/* ---------- Clipboard & downloads ---------- */
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = el('textarea', { 'aria-hidden': 'true', tabindex: '-1', readonly: true });
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function canvasToBlob(canvas, type = 'image/png', quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas export returned no data'))), type, quality);
  });
}

export function dataUrlToBlob(dataUrl) {
  const [head, body] = dataUrl.split(',');
  const mime = /data:([^;]+)/.exec(head)?.[1] || 'application/octet-stream';
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export const slug = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24) || 'wish';

export function debounce(fn, ms = 120) {
  let t = 0;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}
