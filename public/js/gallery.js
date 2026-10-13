/**
 * Identity gallery. Slots with a real `src` show the capture; slots without one
 * show a deliberate "pending original file" holo state instead of a broken image.
 */
import { qs, el } from './util.js';
import { GALLERY_SLOTS } from './config.js';

function slot(spec, index) {
  const hasImage = Boolean(spec.src);
  const node = el('figure', {
    class: `cap ${hasImage ? 'has-img' : 'is-pending'}`,
    'data-slot': spec.id,
  });

  if (hasImage) {
    node.append(el('img', {
      class: 'cap__img',
      src: spec.src,
      alt: `ภาพตัวละครเต็มตัว ลำดับ ${index + 1}`,
      loading: 'lazy',
      decoding: 'async',
    }), el('div', { class: 'cap__veil', 'aria-hidden': 'true' }));
  } else {
    node.append(
      el('div', { class: 'cap__stand' }, el('img', {
        src: spec.stand,
        alt: '',
        loading: 'lazy',
        decoding: 'async',
      })),
      el('div', { class: 'cap__scan' }),
      el('div', { class: 'cap__holo' }),
    );
  }

  node.append(
    el('span', { class: 'cap__corner cap__corner--tl' }),
    el('span', { class: 'cap__corner cap__corner--br' }),
    el('span', { class: 'cap__badge' }, hasImage ? 'CAPTURED' : 'PENDING'),
    el('span', { class: 'cap__pose mono' }, spec.pose || 'ORIGINAL CAPTURE'),
    el('figcaption', { class: 'cap__meta' },
      el('span', { class: 'cap__slot mono' }, spec.label),
      el('span', { class: 'cap__state' }, hasImage ? 'IDENTITY CAPTURE / VERIFIED' : 'รอไฟล์ต้นฉบับ'),
      el('span', { class: 'cap__hint' }, hasImage ? 'ภาพจริง · เลื่อนดูในแฟ้มได้เลย' : 'ลิงก์เดิมใช้งานไม่ได้ — กันช่องไว้ให้แล้ว'),
    ),
  );

  return node;
}

export function initGallery() {
  const grid = qs('#gallery-grid');
  if (!grid) return;
  grid.replaceChildren();
  GALLERY_SLOTS.forEach((spec, index) => grid.append(slot(spec, index)));
}
