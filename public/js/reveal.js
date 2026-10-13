/**
 * ACT 3 — the two art frames alternate gently, then settle into a clear shot.
 */
import { qs, sleep, prefersReduced, flash } from './util.js';
import { sfx } from './audio.js';
import { HOLD } from './qa.js';

export function runReveal({ onDone } = {}) {
  const stage = qs('.reveal__stage');
  const frameA = qs('#reveal-a');
  const frameB = qs('#reveal-b');
  const burst = qs('#reveal-burst');
  const caption = qs('#reveal-caption');
  const skip = qs('#reveal-skip');

  let finished = false;
  let strobeTimer = null;

  const stop = () => {
    window.clearInterval(strobeTimer);
    if (stage) stage.classList.remove('is-strobing');
  };

  const settle = (fast = false) => {
    if (finished) return;
    finished = true;
    stop();

    if (stage) {
      stage.classList.add('is-settled');
      stage.classList.remove('is-strobing');
      stage.classList.add('is-bright');
    }
    if (frameB) frameB.classList.add('is-on');
    if (frameA) frameA.classList.remove('is-on');
    if (burst) burst.classList.add('is-fire');
    if (caption) caption.textContent = 'identity confirmed · wave hrang petrole';

    sfx.burst();
    flash(fast ? 120 : 220, true);

    if (HOLD) return;
    window.setTimeout(() => { if (onDone) onDone(); }, fast ? 420 : 1250);
  };

  if (skip) skip.addEventListener('click', () => { sfx.click(); settle(true); });

  const reduced = prefersReduced();

  if (reduced) {
    if (frameA) frameA.classList.add('is-on');
    window.setTimeout(() => settle(true), 500);
    return { skip: () => settle(true) };
  }

  // strobe phase
  if (stage) stage.classList.add('is-strobing');
  let toggle = false;
  // Slower, softer alternation keeps the cinematic punch without becoming a
  // rapid white strobe that is tiring to watch.
  const interval = 180;
  let beat = 0;
  strobeTimer = window.setInterval(() => {
    toggle = !toggle;
    beat += 1;
    if (frameA) frameA.classList.toggle('is-on', toggle);
    if (frameB) frameB.classList.toggle('is-on', !toggle);
    if (beat % 3 === 0) sfx.strobe();
  }, interval);

  if (caption) caption.textContent = 'decrypting identity…';

  window.setTimeout(() => {
    // brief hold on the red frame for a punchy beat
    if (frameA) frameA.classList.add('is-on');
    if (frameB) frameB.classList.remove('is-on');
  }, 1500);

  window.setTimeout(() => settle(false), 2050);

  return { skip: () => settle(true) };
}

export async function revealPause(ms) {
  await sleep(ms);
}
