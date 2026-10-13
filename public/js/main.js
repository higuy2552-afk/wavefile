/** Orchestrator: wires every module and drives the cinematic act sequence. */
import { qs, qsa, flash, prefersReduced, toast } from './util.js';
import { state, subscribe, set } from './state.js';
import { initFx, intensifyRoses, relaxRoses, refreshFxSources } from './fx.js';
import { initDinos, randomDinoSays, say } from './dinos.js';
import { initChibis, resetChibiBubbles } from './chibi.js';
import { initGallery } from './gallery.js';
import { initLore } from './lore.js';
import { initGlitch } from './glitch.js';
import { initHud, applyTheme, open as openHud } from './hud.js';
import { setEnabled, sfx } from './audio.js';
import { runBoot } from './boot.js';
import { runGate } from './gate.js';
import { runMessages } from './messages.js';
import { runReveal } from './reveal.js';
import { WANTED_ACT, WANT_HUD, WANT_THEME } from './qa.js';

const ACTS = ['boot', 'gate', 'msg', 'reveal', 'file'];

let currentAct = 'boot';
let active = null;

/* ------------------------------------------------------------------ acts */
function showAct(name) {
  currentAct = name;
  document.body.dataset.act = name;
  ACTS.forEach((act) => {
    const node = qs(`#act-${act}`);
    if (node) node.hidden = act !== name;
  });
  tuneAtmosphere(name);
  if (name === 'file') {
    window.scrollTo({ top: 0, behavior: 'auto' });
    resetChibiBubbles();
  }
}

function tuneAtmosphere(act) {
  const eyes = qs('#fx-eyes');
  const roses = qs('#fx-roses');
  if (eyes) {
    // eyes belong to the corridor scenes; in the file act they fade right down
    eyes.style.opacity = act === 'boot' ? '0' : act === 'file' ? '' : '1';
  }
  if (roses) {
    // roses pour down through the whole opening, rest during the strobe, and
    // then settle into the theme-driven density inside the dossier
    if (act === 'reveal') roses.style.opacity = '0';
    else if (act === 'file') roses.style.opacity = '';
    else roses.style.opacity = '1';
  }
  refreshFxSources();
}

function resetActs() {
  const stage = qs('.reveal__stage');
  if (stage) {
    stage.classList.remove('is-strobing', 'is-settled', 'is-bright');
    stage.style.transition = '';
    stage.style.transform = '';
    stage.style.filter = '';
    stage.style.opacity = '';
  }
  const a = qs('#reveal-a');
  const b = qs('#reveal-b');
  if (a) a.classList.remove('is-on');
  if (b) b.classList.remove('is-on');
  const burst = qs('#reveal-burst');
  if (burst) burst.classList.remove('is-fire');
  const stack = qs('#msg-stack');
  if (stack) stack.replaceChildren();
  const gateStage = qs('.gate__core');
  if (gateStage) {
    gateStage.style.transition = '';
    gateStage.style.transform = '';
    gateStage.style.filter = '';
    gateStage.style.opacity = '';
  }
  qsa('.msg__pip').forEach((pip, i) => pip.classList.toggle('is-on', i === 0));
  const nextLabel = qs('#msg-next .btn__label');
  if (nextLabel) nextLabel.textContent = 'ถัดไป';
  const bootBtn = qs('#boot-enter');
  const bootLabel = qs('#boot-enter-label');
  const bootHint = qs('#boot-enter-hint');
  const bootFill = qs('#boot-fill');
  if (bootFill) bootFill.style.width = '0%';
  const bootPct = qs('#boot-pct');
  if (bootPct) bootPct.textContent = '0%';
  const bootLog = qs('#boot-log');
  if (bootLog) bootLog.textContent = 'booting dossier kernel…';
  if (bootBtn) bootBtn.disabled = true;
  if (bootLabel) bootLabel.textContent = 'กำลังเตรียมแฟ้ม…';
  if (bootHint) bootHint.textContent = 'รอสักครู่';
  relaxRoses();
}

/* -------------------------------------------------------------- sequence */
function runSequence() {
  active = null;
  showAct('boot');

  runBoot({
    onEnter: () => {
      flash(220, true);
      window.setTimeout(() => {
        showAct('gate');
        active = runGate({
          onDone: () => {
            showAct('msg');
            active = runMessages({
              onDone: () => {
                showAct('reveal');
                active = runReveal({
                  onDone: () => {
                    showAct('file');
                    relaxRoses();
                    tuneAtmosphere('file');
                    sfx.sparkle();
                    window.setTimeout(() => {
                      const dino = qs('#foot-dino');
                      if (dino && state.dino) randomDinoSays(dino);
                      toast('ยินดีต้อนรับสู่แฟ้มประวัติ — เลื่อนอ่านได้เลย', 3600);
                    }, 900);
                  },
                });
              },
            });
          },
        });
      }, 260);
    },
  });
}

function replay() {
  resetActs();
  runSequence();
}

/* ------------------------------------------------------------------ init */
function init() {
  if (WANT_THEME === 'bio' || WANT_THEME === 'void') set('theme', WANT_THEME);
  initFx();
  initDinos();
  initChibis();
  initGallery();
  initLore();
  initGlitch();
  initHud({ onReplay: replay });
  applyTheme(state.theme);
  setEnabled(state.audio);
  document.documentElement.dataset.motion = state.motion ? 'full' : 'calm';

  const heroHud = qs('#hero-hud');
  if (heroHud) heroHud.addEventListener('click', () => { sfx.click(); openHud(); });

  const replayBtn = qs('#replay-intro');
  if (replayBtn) replayBtn.addEventListener('click', () => { sfx.click(); replay(); });

  // first user gesture unlocks the audio context
  const unlock = () => {
    setEnabled(state.audio);
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });

  subscribe(({ key }) => {
    if (key === '*' || key === 'theme') applyTheme(state.theme);
    if (key === '*' || key === 'audio') setEnabled(state.audio);
    if (key === '*' || key === 'motion') {
      document.documentElement.dataset.motion = state.motion ? 'full' : 'calm';
    }
  });

  // quick skip for anyone who has already seen the corridor
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && (currentAct === 'gate' || currentAct === 'reveal')) {
      if (active && active.skip) active.skip();
    }
    if (event.key.toLowerCase() === 'h' && event.ctrlKey === false && event.metaKey === false
        && currentAct === 'file' && document.activeElement === document.body) {
      const fab = qs('#hud-open');
      if (fab) fab.click();
    }
  });

  window.addEventListener('beforeunload', () => { void state; });

  if (prefersReduced()) {
    document.documentElement.dataset.motion = state.motion ? 'full' : 'calm';
  }

  // Deep entry for returning readers / QA: ?act=file (or ?act=gate|msg|reveal)
  if (ACTS.includes(WANTED_ACT) && WANTED_ACT !== 'boot') {
    jumpTo(WANTED_ACT);
  } else {
    runSequence();
  }

  if (WANT_HUD) window.setTimeout(() => openHud(), 500);
}

function jumpTo(act) {
  resetActs();
  active = null;
  if (act === 'gate') {
    showAct('gate');
    active = runGate({ onDone: () => showAct('file') });
  } else if (act === 'msg') {
    showAct('msg');
    active = runMessages({ onDone: () => showAct('file') });
  } else if (act === 'reveal') {
    showAct('reveal');
    active = runReveal({ onDone: () => showAct('file') });
  } else {
    showAct('file');
    relaxRoses();
    tuneAtmosphere('file');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

export { replay, showAct };
