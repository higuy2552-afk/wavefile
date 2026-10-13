/** Periodic signal-tear glitch on the subject name (pure JS, no extra CSS). */
import { qs, qsa, rand, randInt } from './util.js';
import { state, subscribe } from './state.js';

let timer = null;
let target = null;

function burst() {
  if (!target || !state.glitch) return;
  const lines = qsa('.hero__name-line', target);
  if (!lines.length) return;

  const frames = randInt(4, 8);
  let frame = 0;

  const step = () => {
    frame += 1;
    lines.forEach((line, index) => {
      const dx = rand(-7, 7);
      const dy = rand(-3, 3);
      line.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) skewX(${rand(-7, 7).toFixed(1)}deg)`;
      line.style.textShadow = [
        `${rand(-5, -2).toFixed(1)}px 0 rgba(255,46,77,.85)`,
        `${rand(2, 5).toFixed(1)}px 0 rgba(99,245,176,.8)`,
      ].join(', ');
      line.style.clipPath = `inset(${randInt(0, 42)}% 0 ${randInt(0, 42)}% 0)`;
      line.style.opacity = index === 1 ? '1' : String(rand(0.6, 1).toFixed(2));
    });

    if (frame < frames) {
      window.setTimeout(step, randInt(24, 60));
    } else {
      lines.forEach((line) => {
        line.style.transform = '';
        line.style.textShadow = '';
        line.style.clipPath = '';
        line.style.opacity = '';
      });
    }
  };
  step();
}

function schedule() {
  window.clearTimeout(timer);
  if (!state.glitch) return;
  timer = window.setTimeout(() => {
    burst();
    schedule();
  }, randInt(3200, 7200));
}

export function initGlitch() {
  target = qs('#hero .hero__name') || qs('.hero__name');
  if (!target) return;

  target.addEventListener('pointerenter', burst);

  subscribe(({ key }) => {
    if (key === '*' || key === 'glitch') {
      if (!state.glitch) {
        qsa('.hero__name-line', target).forEach((line) => {
          line.style.transform = '';
          line.style.textShadow = '';
          line.style.clipPath = '';
          line.style.opacity = '';
        });
      }
      schedule();
    }
  });

  schedule();
}
