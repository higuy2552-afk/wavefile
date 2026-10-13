/** Small DOM / math / timing helpers shared by every module. */

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      node.setAttribute(key, value === true ? '' : String(value));
    }
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    node.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return node;
}

export const rand = (min, max) => min + Math.random() * (max - min);
export const randInt = (min, max) => Math.floor(rand(min, max + 1));
export const pick = (list) => list[Math.floor(Math.random() * list.length)];
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const prefersReduced = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let toastTimer = null;

export function toast(message, ms = 3000) {
  const node = qs('#toast');
  if (!node) return;
  node.textContent = message;
  node.hidden = false;
  requestAnimationFrame(() => node.classList.add('is-on'));
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    node.classList.remove('is-on');
    window.setTimeout(() => { node.hidden = true; }, 500);
  }, ms);
}

/** Full-screen white/lime flash used between cinematic acts. */
export function flash(duration = 200, warm = false) {
  const node = qs('#fx-flash');
  if (!node) return;
  node.classList.toggle('is-warm', warm);
  node.classList.add('is-on');
  window.setTimeout(() => node.classList.remove('is-on'), duration);
}

export function raf(fn) {
  let id = 0;
  const loop = (t) => { fn(t); id = requestAnimationFrame(loop); };
  id = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(id);
}

/** Type text into a node at a human-ish pace; resolves when finished. */
export function typeInto(node, text, { speed = 34, jitter = 26, onChar } = {}) {
  return new Promise((resolve) => {
    node.textContent = '';
    let i = 0;
    const step = () => {
      if (i >= text.length) { resolve(); return; }
      const chunk = text.slice(i, i + 1);
      node.textContent += chunk;
      i += 1;
      if (onChar) onChar(chunk, i);
      const ch = text[i - 1];
      const extra = /[.!?…]/.test(ch) ? 190 : /[,·]/.test(ch) ? 90 : 0;
      window.setTimeout(step, speed + Math.random() * jitter + extra);
    };
    step();
  });
}
