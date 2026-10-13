/** ACT 0 — boot console with a click-to-enter gate. */
import { qs, sleep, rand, prefersReduced } from './util.js';
import { sfx } from './audio.js';

const LOGS = [
  'mounting personnel archive…',
  'verifying subject WHP-042…',
  'decrypting physiological record…',
  'indexing tattoos & scar map…',
  'calibrating adrenaline monitor…',
  'restoring relationship matrix…',
  'แฟ้มพร้อมแล้ว — กดเพื่อเปิดอ่าน',
];

export function runBoot({ onEnter } = {}) {
  const fill = qs('#boot-fill');
  const bar = qs('#boot-bar');
  const log = qs('#boot-log');
  const pct = qs('#boot-pct');
  const btn = qs('#boot-enter');
  const label = qs('#boot-enter-label');
  const hint = qs('#boot-enter-hint');

  let value = 0;
  let logIndex = 0;
  let done = false;

  const render = () => {
    if (fill) fill.style.width = `${value.toFixed(1)}%`;
    if (pct) pct.textContent = `${Math.round(value)}%`;
    if (bar) bar.setAttribute('aria-valuenow', String(Math.round(value)));
    const nextIndex = Math.min(LOGS.length - 1, Math.floor((value / 100) * LOGS.length));
    if (log && nextIndex !== logIndex) {
      logIndex = nextIndex;
      log.textContent = LOGS[logIndex];
    }
  };
  render();

  const fast = prefersReduced();
  const step = () => {
    if (done) return;
    value = Math.min(100, value + rand(fast ? 14 : 4, fast ? 26 : 12));
    render();
    if (value >= 100) {
      finish();
      return;
    }
    window.setTimeout(step, fast ? 60 : rand(120, 340));
  };

  const finish = () => {
    done = true;
    render();
    if (log) log.textContent = LOGS[LOGS.length - 1];
    if (btn) {
      btn.disabled = false;
      if (label) label.textContent = 'เปิดแฟ้มประวัติ';
      if (hint) hint.textContent = 'กดเพื่อเข้าไปอ่าน';
      btn.focus({ preventScroll: true });
    }
    sfx.sparkle();
  };

  window.setTimeout(step, 320);

  if (btn) {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      btn.disabled = true;
      sfx.warp();
      if (label) label.textContent = 'กำลังเปิดแฟ้ม…';
      if (hint) hint.textContent = 'วาร์ปเข้าสู่แฟ้ม';
      if (onEnter) onEnter();
    });
  }

  return {
    skip: () => {
      value = 100;
      finish();
    },
  };
}

export async function bootIdleDino() {
  await sleep(1);
}
