import { getState, setState, subscribe } from '../state.js';
import { $$, clamp, toast } from '../utils/helpers.js';

/**
 * Sound system.
 *  - Nothing plays until the person presses a control (no autoplay).
 *  - Music: optional /audio/music.mp3 if present, otherwise an original
 *    generative ambient loop synthesised with the Web Audio API.
 *  - SFX: optional /audio/gift.mp3 + /audio/firework.mp3, otherwise synthesised.
 *  - Missing files are handled silently - the synth is used instead.
 */
let ctx = null;
let master = null;
let musicBus = null;
let sfxBus = null;
let fileMusic = null;
let fileProbe = null; // Promise<boolean>
let timer = 0;
let nextNote = 0;
let step = 0;
let droneNodes = [];
let lastFirework = 0;

const AudioCtx = window.AudioContext || window.webkitAudioContext;
// D major pentatonic (Bhupali-like): D E F# A B
const SCALE = [146.83, 164.81, 185.0, 220.0, 246.94, 293.66, 329.63, 369.99, 440.0, 493.88];

const base = () => import.meta.env?.BASE_URL || './';

function probe(name) {
  return fetch(`${base()}audio/${name}`, { method: 'HEAD' })
    .then((r) => r.ok && (r.headers.get('content-type') || '').startsWith('audio'))
    .catch(() => false);
}

function ensureContext() {
  if (!AudioCtx) return null;
  if (!ctx) {
    ctx = new AudioCtx();
    master = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    musicBus.gain.value = 0.55;
    sfxBus.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    musicBus.connect(master);
    sfxBus.connect(master);
    master.connect(comp);
    comp.connect(ctx.destination);
    applyVolume();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function applyVolume() {
  const { muted, volume } = getState().music;
  if (master) master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.04);
  if (fileMusic) {
    fileMusic.muted = muted;
    fileMusic.volume = clamp(volume, 0, 1);
  }
}

/* ---------- synthesis helpers ---------- */
function bell(freq, when, { gain = 0.16, decay = 2.4, bus = musicBus } = {}) {
  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  const g = ctx.createGain();
  o1.type = 'sine';
  o2.type = 'triangle';
  o1.frequency.value = freq;
  o2.frequency.value = freq * 2.01;
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
  const g2 = ctx.createGain();
  g2.gain.value = 0.28;
  o1.connect(g);
  o2.connect(g2).connect(g);
  g.connect(bus);
  o1.start(when);
  o2.start(when);
  o1.stop(when + decay + 0.05);
  o2.stop(when + decay + 0.05);
}

function noiseBurst(when, { dur = 0.35, gain = 0.3, from = 4200, to = 500, type = 'bandpass' } = {}) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(from, when);
  f.frequency.exponentialRampToValueAtTime(to, when + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  src.connect(f).connect(g).connect(sfxBus);
  src.start(when);
}

function startDrone() {
  const mk = (freq, gain) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 2.5);
    o.connect(g).connect(musicBus);
    o.start();
    droneNodes.push({ o, g });
  };
  mk(73.42, 0.09);
  mk(110.0, 0.05);
  mk(146.83, 0.025);
}

function stopDrone() {
  const t = ctx.currentTime;
  droneNodes.forEach(({ o, g }) => {
    g.gain.cancelScheduledValues(t);
    g.gain.setTargetAtTime(0, t, 0.25);
    o.stop(t + 1.2);
  });
  droneNodes = [];
}

const PATTERN = [0, 2, 4, 3, 5, 4, 2, 3, 1, 2, 4, 6, 5, 4, 3, 2];
function schedule() {
  if (!ctx) return;
  while (nextNote < ctx.currentTime + 0.6) {
    const idx = PATTERN[step % PATTERN.length] + (step % 32 > 15 ? 1 : 0);
    const f = SCALE[clamp(idx, 0, SCALE.length - 1)];
    if (step % 2 === 0 || Math.random() > 0.35) bell(f, nextNote, { gain: step % 4 === 0 ? 0.13 : 0.07, decay: 2.8 });
    if (step % 8 === 0) bell(f / 2, nextNote, { gain: 0.1, decay: 3.6 });
    nextNote += 0.62;
    step += 1;
  }
}

async function startMusic() {
  if (fileProbe === null) fileProbe = probe('music.mp3');
  if (await fileProbe) {
    if (!fileMusic) {
      fileMusic = new Audio(`${base()}audio/music.mp3`);
      fileMusic.loop = true;
      fileMusic.addEventListener('error', () => { fileMusic = null; fileProbe = Promise.resolve(false); if (getState().music.playing) startSynth(); });
    }
    ensureContext();
    applyVolume();
    try {
      await fileMusic.play();
      return;
    } catch {
      fileMusic = null;
    }
  }
  startSynth();
}

function startSynth() {
  const c = ensureContext();
  if (!c) {
    toast('Audio is not supported in this browser.', 'error');
    setState({ music: { playing: false } });
    return;
  }
  stopSynthTimers();
  nextNote = c.currentTime + 0.1;
  step = 0;
  startDrone();
  timer = window.setInterval(schedule, 150);
  schedule();
}

function stopSynthTimers() {
  if (timer) window.clearInterval(timer);
  timer = 0;
}

function stopMusic() {
  stopSynthTimers();
  if (ctx && droneNodes.length) stopDrone();
  if (fileMusic) fileMusic.pause();
}

/* ---------- public API ---------- */
export function setPlaying(on) {
  if (on === getState().music.playing) return;
  setState({ music: { playing: on } });
  if (on) {
    // Pressing play also un-mutes: the intent is clearly to hear it.
    if (getState().music.muted) setState({ music: { muted: false } });
    startMusic();
  } else {
    stopMusic();
  }
}
export const toggleMusic = () => setPlaying(!getState().music.playing);
export const toggleMute = () => {
  ensureContext();
  setState({ music: { muted: !getState().music.muted } });
};
export const setVolume = (v) => {
  ensureContext();
  setState({ music: { volume: clamp(Number(v) || 0, 0, 1), muted: false } });
};

async function playFileSfx(name) {
  if (!(await probe(name))) return false;
  const a = new Audio(`${base()}audio/${name}`);
  const { muted, volume } = getState().music;
  a.volume = muted ? 0 : volume;
  try { await a.play(); return true; } catch { return false; }
}

/** Gift opening chime. Must be called from a user gesture. */
export async function playGiftSfx() {
  const { muted } = getState().music;
  if (muted) return;
  if (await playFileSfx('gift.mp3')) return;
  const c = ensureContext();
  if (!c) return;
  const t = c.currentTime + 0.02;
  [0, 2, 4, 5, 7, 9].forEach((n, i) => bell(SCALE[n], t + i * 0.09, { gain: 0.14, decay: 2.2, bus: sfxBus }));
  noiseBurst(t, { dur: 0.9, gain: 0.08, from: 9000, to: 2500, type: 'highpass' });
}

/** Firework thump + crackle. Throttled so rapid taps stay cheap. */
export async function playFireworkSfx() {
  const now = performance.now();
  if (now - lastFirework < 140) return;
  lastFirework = now;
  const { muted } = getState().music;
  if (muted) return;
  if (await playFileSfx('firework.mp3')) return;
  const c = ensureContext();
  if (!c) return;
  const t = c.currentTime + 0.01;
  noiseBurst(t, { dur: 0.5, gain: 0.34, from: 1600, to: 120, type: 'lowpass' });
  for (let i = 0; i < 5; i += 1) noiseBurst(t + 0.08 + i * 0.07 + Math.random() * 0.04, { dur: 0.08, gain: 0.07, from: 6000, to: 3000, type: 'highpass' });
}

/** Wire every [data-music-*] control and keep them in sync with state. */
export function initMusic() {
  const toggles = $$('[data-music-toggle]');
  const mutes = $$('[data-music-mute]');
  const volumes = $$('[data-music-volume]');
  const panelBtn = document.querySelector('[data-sound-panel-btn]');
  const panel = document.querySelector('#sound-panel');

  toggles.forEach((b) => b.addEventListener('click', toggleMusic));
  mutes.forEach((b) => b.addEventListener('click', toggleMute));
  volumes.forEach((v) => v.addEventListener('input', () => setVolume(v.value / 100)));

  if (panelBtn && panel) {
    const close = () => { panel.hidden = true; panelBtn.setAttribute('aria-expanded', 'false'); };
    panelBtn.addEventListener('click', () => {
      const open = panel.hidden;
      panel.hidden = !open;
      panelBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => { if (!panel.hidden && !panel.contains(e.target) && !panelBtn.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { close(); panelBtn.focus(); } });
  }

  const render = () => {
    const { playing, muted, volume } = getState().music;
    toggles.forEach((b) => {
      b.setAttribute('aria-pressed', String(playing));
      b.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
      const label = b.querySelector('[data-label]');
      if (label) label.textContent = playing ? 'Pause music' : 'Play music';
      const use = b.querySelector('use');
      if (use) use.setAttribute('href', playing ? '#i-pause' : '#i-play');
    });
    mutes.forEach((b) => {
      b.setAttribute('aria-pressed', String(muted));
      b.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
      const label = b.querySelector('[data-label]');
      if (label) label.textContent = muted ? 'Sound off' : 'Sound on';
      const use = b.querySelector('use');
      if (use) use.setAttribute('href', muted || volume === 0 ? '#i-mute' : '#i-volume');
    });
    volumes.forEach((v) => { if (Number(v.value) !== Math.round(volume * 100)) v.value = String(Math.round(volume * 100)); });
    if (ctx) applyVolume();
  };
  subscribe(render);
  render();

  // Stop the synth while the tab is hidden; resume on return if the person had it playing.
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else if (getState().music.playing || getState().screen) ctx.resume().catch(() => {});
  });
}
