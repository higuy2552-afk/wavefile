/** The control deck: build switches, wire scene actions, keep everything in sync. */
import { qs, el, toast } from './util.js';
import { SWITCHES } from './config.js';
import { state, set, toggle, subscribe, resetAll } from './state.js';
import { sfx, setEnabled } from './audio.js';

let panel = null;
let fab = null;
let built = false;
const switches = new Map();

export function initHud({ onReplay } = {}) {
  panel = qs('#hud');
  fab = qs('#hud-open');
  if (!panel || !fab) return;

  buildSwitches();
  syncAll();

  fab.addEventListener('click', () => open());
  const close = qs('#hud-close');
  if (close) close.addEventListener('click', () => closePanel());

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) closePanel();
  });

  const hudTheme = qs('#hud-theme');
  if (hudTheme) {
    hudTheme.addEventListener('click', () => {
      const next = state.theme === 'bio' ? 'void' : 'bio';
      set('theme', next);
      applyTheme(next);
      sfx.click();
      toast(next === 'bio' ? 'โหมดสว่าง — แฟ้มกระดาษสีเขียวขาว' : 'โหมดมืด — แฟ้มในความมืด');
    });
  }

  const hudReplay = qs('#hud-replay');
  if (hudReplay) {
    hudReplay.addEventListener('click', () => {
      closePanel();
      if (onReplay) onReplay();
    });
  }

  const allOn = qs('#hud-all-on');
  if (allOn) {
    allOn.addEventListener('click', () => {
      resetAll({ audio: state.audio, theme: state.theme });
      applyTheme(state.theme);
      sfx.click();
      toast('เปิดลูกเล่นทั้งหมดแล้ว');
    });
  }
  const allOff = qs('#hud-all-off');
  if (allOff) {
    allOff.addEventListener('click', () => {
      resetAll({
        rain: false, eyes: false, particles: false, chibi: false, dino: false,
        glitch: false, scan: false, grain: false, audio: state.audio, theme: state.theme,
      });
      applyTheme(state.theme);
      sfx.click();
      toast('ปิดลูกเล่นทั้งหมด — เหลือแค่ตัวแฟ้ม');
    });
  }

  subscribe(() => syncAll());
}

function buildSwitches() {
  if (built) return;
  built = true;
  const host = qs('#hud-switches');
  if (!host) return;

  SWITCHES.forEach((spec) => {
    const btn = el('button', {
      class: 'sw',
      type: 'button',
      role: 'switch',
      'aria-pressed': String(Boolean(state[spec.key])),
      'data-key': spec.key,
      onclick: () => {
        toggle(spec.key);
        sfx.click();
      },
      onpointerenter: () => sfx.hover(),
    },
      el('span', { class: 'sw__ico', 'aria-hidden': 'true' }, spec.icon),
      el('span', { class: 'sw__body' },
        el('span', { class: 'sw__name' }, spec.name),
        el('span', { class: 'sw__desc' }, spec.desc),
      ),
      el('span', { class: 'sw__track' }, el('span', { class: 'sw__knob' })),
    );
    switches.set(spec.key, btn);
    host.append(btn);
  });
}

function syncAll() {
  switches.forEach((btn, key) => {
    btn.setAttribute('aria-pressed', String(Boolean(state[key])));
  });
  setEnabled(state.audio);
  applyTheme(state.theme);
  document.documentElement.dataset.motion = state.motion ? 'full' : 'calm';
}

export function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.filetheme = theme === 'void' ? 'void' : 'bio';
  const meta = qs('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'void' ? '#06120C' : '#EEF8EF');
}

export function open() {
  if (!panel) return;
  panel.hidden = false;
  fab.setAttribute('aria-expanded', 'true');
  sfx.click();
  const first = panel.querySelector('.sw');
  if (first) first.focus({ preventScroll: true });
}

export function closePanel() {
  if (!panel) return;
  panel.hidden = true;
  if (fab) {
    fab.setAttribute('aria-expanded', 'false');
    fab.focus({ preventScroll: true });
  }
  sfx.click();
}

export function togglePanel() {
  if (!panel) return;
  if (panel.hidden) open(); else closePanel();
}
