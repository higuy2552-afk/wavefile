/**
 * Tiny WebAudio synth — every interface sound is generated, so the site ships
 * with zero audio assets. Audio starts muted and only wakes on a user gesture.
 */

let ctx = null;
let master = null;
let enabled = false;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(ctx.destination);
  return ctx;
}

export function setEnabled(on) {
  enabled = !!on;
  if (enabled) {
    const c = ensure();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
  }
}

export function isEnabled() {
  return enabled;
}

function tone({ freq = 440, dur = 0.12, type = 'square', gain = 0.5, sweep = 0, delay = 0 }) {
  if (!enabled) return;
  const c = ensure();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweep) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + sweep), t0 + dur);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function noise({ dur = 0.4, gain = 0.35, delay = 0, lowpass = 1400 }) {
  if (!enabled) return;
  const c = ensure();
  if (!c) return;
  const frames = Math.floor(c.sampleRate * dur);
  const buffer = c.createBuffer(1, frames, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = lowpass;
  const amp = c.createGain();
  amp.gain.value = gain;
  src.connect(filter).connect(amp).connect(master);
  src.start(c.currentTime + delay);
}

export const sfx = {
  hover() { tone({ freq: 1180, dur: 0.05, type: 'triangle', gain: 0.16 }); },
  click() {
    tone({ freq: 640, dur: 0.07, type: 'square', gain: 0.32 });
    tone({ freq: 1280, dur: 0.05, type: 'square', gain: 0.18, delay: 0.05 });
  },
  tick() { tone({ freq: 2100, dur: 0.02, type: 'square', gain: 0.09 }); },
  warp() {
    tone({ freq: 120, dur: 0.9, type: 'sawtooth', gain: 0.28, sweep: 1500 });
    noise({ dur: 1.1, gain: 0.22, lowpass: 900 });
  },
  thud() {
    tone({ freq: 90, dur: 0.35, type: 'sine', gain: 0.5, sweep: -40 });
    noise({ dur: 0.3, gain: 0.18, lowpass: 400 });
  },
  strobe() { tone({ freq: 2600, dur: 0.03, type: 'square', gain: 0.12 }); },
  burst() {
    noise({ dur: 0.7, gain: 0.3, lowpass: 5200 });
    tone({ freq: 880, dur: 0.5, type: 'triangle', gain: 0.24, sweep: 900 });
  },
  sparkle() {
    [1568, 2093, 2637].forEach((f, i) =>
      tone({ freq: f, dur: 0.14, type: 'triangle', gain: 0.16, delay: i * 0.06 }));
  },
};
