/**
 * ACT 2 — the three opening lines, typed one at a time.
 * Once a line finishes it blurs out gently before the next one arrives, so the
 * reader's eyes get a soft hand-off instead of a hard cut.
 */
import { qs, qsa, el, prefersReduced } from './util.js';
import { OPENING_LINES } from './config.js';
import { sfx } from './audio.js';
import { HOLD } from './qa.js';

const AUTO_ADVANCE_MS = 2300;
const LABELS = ['MESSAGE 01', 'MESSAGE 02', 'MESSAGE 03'];

export function runMessages({ onDone } = {}) {
  const stack = qs('#msg-stack');
  const nextBtn = qs('#msg-next');
  const nextLabel = nextBtn ? qs('.btn__label', nextBtn) : null;
  const skipBtn = qs('#msg-skip');
  const pips = qsa('.msg__pip');

  if (!stack) {
    if (onDone) onDone();
    return { skip() {} };
  }

  stack.replaceChildren();

  const reduced = prefersReduced();
  const session = {
    index: -1,
    done: false,
    typing: false,
    completeTyping: null,
    autoTimer: 0,
  };

  const setPip = (active) => {
    pips.forEach((pip, i) => pip.classList.toggle('is-on', i <= active));
  };

  const markDone = (bubble) => {
    if (!bubble) return;
    bubble.classList.add('is-done');
    bubble.classList.remove('is-live');
  };

  const finishAll = () => {
    if (session.done) return;
    session.done = true;
    window.clearTimeout(session.autoTimer);
    sfx.burst();
    if (!HOLD && onDone) onDone();
  };

  const typeText = (node, text) => new Promise((resolve) => {
    let i = 0;
    let settled = false;

    const settle = () => {
      if (settled) return;
      settled = true;
      session.typing = false;
      session.completeTyping = null;
      resolve();
    };

    session.typing = true;
    session.completeTyping = () => {
      node.textContent = text;
      settle();
    };

    const step = () => {
      if (settled) return;
      if (i >= text.length) { settle(); return; }
      const ch = text[i];
      node.textContent += ch;
      i += 1;
      if (!reduced && Math.random() > 0.7) sfx.tick();
      const pause = reduced
        ? 6
        : 26 + Math.random() * 26 + (/[.!?…]/.test(ch) ? 210 : /[,·]/.test(ch) ? 80 : 0);
      window.setTimeout(step, pause);
    };
    step();
  });

  const showNext = async () => {
    window.clearTimeout(session.autoTimer);
    markDone(stack.lastElementChild);

    session.index += 1;
    if (session.index >= OPENING_LINES.length) { finishAll(); return; }
    setPip(session.index);

    const typed = el('span', { class: 'bubble__typed' });
    const cursor = el('span', { class: 'bubble__cursor', 'aria-hidden': 'true' }, '▍');
    const bubble = el('div', { class: 'bubble is-live' },
      el('span', { class: 'bubble__idx mono' }, LABELS[session.index] || 'MESSAGE'),
      el('p', { class: 'bubble__text' }, typed, cursor),
    );
    stack.append(bubble);

    await typeText(typed, OPENING_LINES[session.index] || '');
    if (session.done) return;

    cursor.remove();
    if (nextLabel) {
      nextLabel.textContent = session.index < OPENING_LINES.length - 1
        ? 'ถัดไป'
        : 'เปิดแฟ้มประวัติ';
    }
    if (nextBtn) nextBtn.classList.toggle('is-final', session.index >= OPENING_LINES.length - 1);

    const isLast = session.index >= OPENING_LINES.length - 1;
    if (!(HOLD && isLast)) {
      session.autoTimer = window.setTimeout(() => {
        if (!session.done) showNext();
      }, AUTO_ADVANCE_MS);
    }
  };

  const advance = () => {
    if (session.done) return;
    if (session.typing && session.completeTyping) {
      session.completeTyping();
      return;
    }
    showNext();
  };

  if (nextBtn) nextBtn.addEventListener('click', advance);
  if (skipBtn) skipBtn.addEventListener('click', () => { sfx.click(); finishAll(); });

  document.addEventListener('keydown', (event) => {
    if (session.done) return;
    if (document.body.dataset.act !== 'msg') return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      advance();
    }
  });

  showNext();

  return { skip: finishAll };
}
