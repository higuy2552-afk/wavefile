/** Atmosphere: rose rain, watching eyes, particle field. */
import { qs, el, rand, randInt, pick, raf, prefersReduced } from './util.js';
import { state, subscribe } from './state.js';

let roseHost = null;
let eyeHost = null;
let canvas = null;
let ctx = null;
let stopParticles = null;
let pointer = { x: 0.5, y: 0.5 };
let eyeRepositionTimer = null;

/* ------------------------------------------------------------------ roses */
const ROSE_SRC = { dark: '/assets/rose.webp', light: '/assets/rose_light.webp' };
const EYE_SRC = { dark: '/assets/eyes.webp', light: '/assets/eyes_light.webp' };

/** The dark "glow" cut works over the cinematic acts; the light cutout is only
 *  used once the green/white dossier is on screen, where GIF dithering would
 *  otherwise read as a faint rectangle. */
function useLightCut() {
  return document.body.dataset.act === 'file' && state.theme !== 'void';
}

export function roseSource() {
  return useLightCut() ? ROSE_SRC.light : ROSE_SRC.dark;
}

export function eyeSource() {
  return useLightCut() ? EYE_SRC.light : EYE_SRC.dark;
}

function buildRose(scale = 1) {
  const size = rand(38, 108) * scale;
  const node = el('span', {
    class: 'rose',
    style: [
      `left:${rand(-4, 98).toFixed(2)}vw`,
      `width:${size.toFixed(0)}px`,
      `--dx:${rand(-14, 14).toFixed(1)}vw`,
      `--r0:${rand(-40, 40).toFixed(0)}deg`,
      `--rs:${rand(-420, 420).toFixed(0)}deg`,
      `--s:${rand(0.75, 1.25).toFixed(2)}`,
      `--o:${rand(0.5, 0.95).toFixed(2)}`,
      `animation-duration:${rand(9, 22).toFixed(1)}s`,
      `animation-delay:${(-rand(0, 18)).toFixed(1)}s`,
    ].join(';'),
  }, el('img', { src: roseSource(), alt: '', loading: 'lazy', decoding: 'async' }));
  return node;
}

export function buildRoses(count) {
  if (!roseHost) return;
  roseHost.replaceChildren();
  for (let i = 0; i < count; i += 1) roseHost.append(buildRose());
}

function refreshRoseSources() {
  if (!roseHost) return;
  const src = roseSource();
  roseHost.querySelectorAll('img').forEach((img) => { img.src = src; });
}

/** Swap both loops to the cut that matches the act/theme now on screen. */
export function refreshFxSources() {
  refreshRoseSources();
  if (!eyeHost) return;
  const src = eyeSource();
  eyeHost.querySelectorAll('img').forEach((img) => { img.src = src; });
}

/* ------------------------------------------------------------------- eyes */
function buildEye() {
  const node = el('span', {
    class: 'eye',
    style: [
      `left:${rand(4, 96).toFixed(2)}vw`,
      `top:${rand(8, 92).toFixed(2)}vh`,
      `width:${rand(70, 190).toFixed(0)}px`,
      `--life:${rand(5.5, 11).toFixed(1)}s`,
      `--delay:${(-rand(0, 8)).toFixed(1)}s`,
    ].join(';'),
  }, el('img', { src: eyeSource(), alt: '', loading: 'lazy', decoding: 'async' }));
  return node;
}

export function buildEyes(count) {
  if (!eyeHost) return;
  eyeHost.replaceChildren();
  for (let i = 0; i < count; i += 1) eyeHost.append(buildEye());
}

function repositionEyes() {
  if (!eyeHost || !state.eyes) return;
  eyeHost.querySelectorAll('.eye').forEach((eye) => {
    eye.style.left = `${rand(4, 96).toFixed(2)}vw`;
    eye.style.top = `${rand(8, 92).toFixed(2)}vh`;
  });
}

function applyEyeParallax() {
  if (!eyeHost) return;
  const dx = (pointer.x - 0.5) * 26;
  const dy = (pointer.y - 0.5) * 20;
  eyeHost.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
}

/* -------------------------------------------------------------- particles */
function sizeCanvas() {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function startParticles() {
  if (!canvas || stopParticles) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = () => window.innerWidth;
  const h = () => window.innerHeight;
  const count = Math.round(Math.min(120, Math.max(36, (w() * h()) / 22000)));
  const motes = Array.from({ length: count }, () => ({
    x: rand(0, w()),
    y: rand(0, h()),
    r: rand(0.6, 2.6),
    vx: rand(-0.22, 0.22),
    vy: rand(-0.5, -0.06),
    a: rand(0.15, 0.7),
    hue: Math.random() > 0.72 ? 'blood' : Math.random() > 0.4 ? 'lime' : 'mint',
  }));

  const color = { lime: [182, 255, 60], mint: [99, 245, 176], blood: [255, 90, 110] };

  stopParticles = raf(() => {
    if (!ctx) return;
    ctx.clearRect(0, 0, w(), h());
    for (const m of motes) {
      m.x += m.vx;
      m.y += m.vy;
      if (m.y < -12) { m.y = h() + 8; m.x = rand(0, w()); }
      if (m.x < -12) m.x = w() + 8;
      if (m.x > w() + 12) m.x = -8;
      const [r, g, b] = color[m.hue];
      ctx.beginPath();
      ctx.fillStyle = `rgba(${r},${g},${b},${m.a})`;
      ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
      ctx.shadowBlur = m.r * 5;
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  });

  sizeCanvas();
  void dpr;
}

function stopParticlesLoop() {
  if (stopParticles) { stopParticles(); stopParticles = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* --------------------------------------------------------------- lifecycle */
export function initFx() {
  roseHost = qs('#fx-roses');
  eyeHost = qs('#fx-eyes');
  canvas = qs('#fx-particles');
  ctx = canvas ? canvas.getContext('2d') : null;

  const heavy = prefersReduced() ? 8 : 16;
  buildRoses(heavy);
  buildEyes(prefersReduced() ? 3 : 7);

  apply('rain', state.rain);
  apply('eyes', state.eyes);
  apply('particles', state.particles);

  window.addEventListener('resize', sizeCanvas, { passive: true });
  window.addEventListener('pointermove', (event) => {
    pointer = { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight };
    applyEyeParallax();
  }, { passive: true });

  eyeRepositionTimer = window.setInterval(repositionEyes, 6500);

  subscribe(({ key }) => {
    if (key === '*' || key === 'rain') apply('rain', state.rain);
    if (key === '*' || key === 'eyes') apply('eyes', state.eyes);
    if (key === '*' || key === 'particles') apply('particles', state.particles);
    if (key === '*' || key === 'theme') refreshRoseSources();
  });
}

function apply(key, on) {
  if (key === 'rain') {
    if (roseHost) roseHost.style.display = on ? '' : 'none';
  } else if (key === 'eyes') {
    if (eyeHost) eyeHost.style.display = on ? '' : 'none';
    if (on) repositionEyes();
  } else if (key === 'particles') {
    if (on) startParticles(); else stopParticlesLoop();
  }
}

/** Temporarily crank the rose density for the warp corridor. */
export function intensifyRoses(multiplier = 2.4) {
  if (!roseHost) return;
  const base = roseHost.childElementCount || 12;
  buildRoses(Math.round(base * multiplier));
  roseHost.style.opacity = '1';
}

export function relaxRoses() {
  buildRoses(prefersReduced() ? 8 : 16);
  roseHost.style.opacity = '';
}

export function randomDinoLine(lines) {
  return pick(lines);
}

export { randInt };
