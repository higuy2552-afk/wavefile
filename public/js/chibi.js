/** Chibi cast drifting along the page gutters — click one for a reaction. */
import { qs, el, pick, clamp } from './util.js';
import { CHIBIS, CHIBI_LINES } from './config.js';
import { state, subscribe } from './state.js';
import { sfx } from './audio.js';

let dock = null;
let bubble = null;
let bubbleTimer = null;

function chibiButton(item, index) {
  const node = el('button', {
    class: `chibi chibi--${item.side}`,
    type: 'button',
    'aria-label': 'จิบิตัวละคร — กดเพื่อดูคำพูด',
    style: [
      `top:${item.top}`,
      `width:clamp(58px, ${item.w}, 122px)`,
      `--tilt:${item.tilt}`,
      `--dur:${item.dur}`,
      `--delay:${item.delay}`,
      `z-index:${index}`,
    ].join(';'),
  }, el('img', { src: item.src, alt: '', loading: 'lazy', decoding: 'async' }));

  node.addEventListener('click', () => {
    sfx.sparkle();
    node.classList.remove('is-bump');
    void node.offsetWidth;
    node.classList.add('is-bump');
    speak(node, pick(CHIBI_LINES));
  });
  return node;
}

function speak(anchor, text) {
  if (bubble) bubble.remove();
  const rect = anchor.getBoundingClientRect();
  bubble = el('div', { class: 'chibi-bubble', role: 'status' }, text);
  document.body.append(bubble);

  const width = bubble.offsetWidth;
  const preferLeft = rect.left + rect.width / 2 > window.innerWidth / 2;
  const rawLeft = preferLeft ? rect.left - width - 14 : rect.right + 14;
  const left = clamp(rawLeft, 8, window.innerWidth - width - 8);
  const top = clamp(rect.top + rect.height / 2, 90, window.innerHeight - 90);

  bubble.style.left = `${left + width / 2}px`;
  bubble.style.top = `${top}px`;
  bubble.style.transform = 'translate(-50%, -100%)';

  window.clearTimeout(bubbleTimer);
  bubbleTimer = window.setTimeout(() => {
    if (bubble) { bubble.remove(); bubble = null; }
  }, 3600);
}

export function initChibis() {
  dock = qs('#chibi-dock');
  if (!dock) return;
  dock.replaceChildren();
  CHIBIS.forEach((item, index) => dock.append(chibiButton(item, index)));
  apply();
  subscribe(({ key }) => { if (key === '*' || key === 'chibi') apply(); });
}

function apply() {
  if (dock) dock.style.display = state.chibi ? '' : 'none';
  if (!state.chibi && bubble) { bubble.remove(); bubble = null; }
}

/** Called when the file act becomes visible so bubbles never linger. */
export function resetChibiBubbles() {
  if (bubble) { bubble.remove(); bubble = null; }
}
