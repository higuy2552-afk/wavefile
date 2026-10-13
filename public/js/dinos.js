/** The cute dinosaur crew: decorative mounts, HUD buttons, speech bubbles. */
import { qs, el, pick, toast } from './util.js';
import { DINOS, DINO_IDLE } from './config.js';
import { state, subscribe, toggle } from './state.js';
import { sfx } from './audio.js';

const MOUNTS = ['#boot-dino', '#msg-dino', '#foot-dino'];
let bubbleTimer = null;

export function dinoNode(dino, { extraClass = '' } = {}) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', `dino ${dino.cls || ''} ${extraClass}`.trim());
  svg.setAttribute('viewBox', '0 0 150 130');
  svg.setAttribute('aria-hidden', 'true');
  // Clone the symbol markup directly (instead of <use>) so the document
  // stylesheet can actually colour the individual body parts.
  const symbol = document.getElementById(dino.symbol);
  if (symbol) svg.innerHTML = symbol.innerHTML;
  return svg;
}

export function say(anchor, text, ms = 3200) {
  document.querySelectorAll('.dino-say').forEach((n) => n.remove());
  const rect = anchor.getBoundingClientRect();
  const node = el('div', { class: 'dino-say', role: 'status' }, text);
  document.body.append(node);
  const w = node.offsetWidth;
  const left = Math.min(
    Math.max(rect.left + rect.width / 2 - w / 2, 8),
    window.innerWidth - w - 8,
  );
  const above = rect.top > 140;
  node.style.left = `${left}px`;
  node.style.top = above ? `${rect.top - node.offsetHeight - 12}px` : `${rect.bottom + 12}px`;

  window.clearTimeout(bubbleTimer);
  bubbleTimer = window.setTimeout(() => node.remove(), ms);
  return node;
}

export function randomDinoSays(anchor) {
  say(anchor, pick(DINO_IDLE));
}

export function initDinos() {
  const hosts = MOUNTS.map((sel) => qs(sel)).filter(Boolean);
  hosts.forEach((host, index) => {
    const dino = DINOS[index % DINOS.length];
    host.append(dinoNode(dino));
    host.addEventListener('click', () => {
      sfx.sparkle();
      say(host, pick([dino.line, ...DINO_IDLE]));
    });
  });

  const deck = qs('#hud-dinos');
  if (deck) {
    DINOS.forEach((dino) => {
      const btn = el('button', {
        class: 'dino-btn',
        type: 'button',
        title: `${dino.name} — กดเพื่อสุ่มลูกเล่น`,
        onclick: () => {
          sfx.click();
          btn.classList.remove('is-bump');
          void btn.offsetWidth;
          btn.classList.add('is-bump');
          const target = pick(['rain', 'eyes', 'particles', 'chibi', 'glitch', 'scan', 'grain']);
          toggle(target);
          say(btn, `${dino.line} (สลับ: ${target})`);
        },
      }, dinoNode(dino), el('span', { class: 'dino-btn__txt' }, dino.name));
      deck.append(btn);
    });
  }

  apply();
  subscribe(({ key }) => { if (key === '*' || key === 'dino') apply(); });
}

function apply() {
  const on = state.dino;
  MOUNTS.forEach((sel) => {
    const host = qs(sel);
    if (host) host.style.display = on ? '' : 'none';
  });
  const deck = qs('#hud-dinos');
  if (deck) deck.style.opacity = on ? '1' : '0.4';
  if (!on) document.querySelectorAll('.dino-say').forEach((n) => n.remove());
}

export function toastDinoHint() {
  toast('ไดโนเสาร์จะคอยกดสวิตช์ให้ — ลองคลิกดูสิ');
}
