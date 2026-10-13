/** ACT 1 — warp corridor: roses fall like rain while something watches. */
import { qs, sleep, prefersReduced } from './util.js';
import { sfx } from './audio.js';
import { intensifyRoses, relaxRoses } from './fx.js';
import { HOLD } from './qa.js';

const SCRIPT = [
  { at: 0,    line: '> establishing warp corridor…',        sub: 'กุหลาบกำลังร่วงลงมา… และมีบางอย่างกำลังจับตาคุณอยู่' },
  { at: 1500, line: '> rose field density: rising',          sub: 'โปรยลงมาเหมือนฝน… อย่าเพิ่งหลบสายตา' },
  { at: 3200, line: '> visual contact: two eyes detected',   sub: 'มีดวงตาคม ๆ กำลังเฝ้ามองอยู่ตรงนั้น' },
  { at: 5000, line: '> warping into dossier…',               sub: 'กำลังวาร์ปเข้าสู่แฟ้มประวัติ' },
];

export function runGate({ onDone } = {}) {
  const line = qs('#gate-line');
  const sub = qs('#gate-sub');
  const skip = qs('#gate-skip');
  const stage = qs('.gate__core');
  const timers = [];
  let finished = false;

  intensifyRoses(2.6);
  sfx.warp();

  SCRIPT.forEach((beat) => {
    timers.push(window.setTimeout(() => {
      if (finished) return;
      if (line) line.textContent = beat.line;
      if (sub) sub.textContent = beat.sub;
      sfx.tick();
    }, beat.at));
  });

  const finish = (fast = false) => {
    if (finished) return;
    finished = true;
    timers.forEach((t) => window.clearTimeout(t));
    if (stage) {
      stage.style.transition = 'transform .55s cubic-bezier(.22,1,.36,1), filter .55s ease, opacity .55s ease';
      stage.style.transform = fast ? 'scale(1.1)' : 'scale(6)';
      stage.style.filter = 'blur(14px)';
      stage.style.opacity = '0';
    }
    relaxRoses();
    window.setTimeout(() => { if (onDone) onDone(); }, fast ? 180 : 560);
  };

  if (skip) skip.addEventListener('click', () => { sfx.click(); finish(true); });

  const duration = prefersReduced() ? 2200 : 6400;
  if (!HOLD) timers.push(window.setTimeout(() => finish(false), duration));

  return { skip: () => finish(true) };
}

export async function gatePause(ms) {
  await sleep(ms);
}
