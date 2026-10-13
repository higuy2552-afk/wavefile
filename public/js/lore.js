/** Dossier behaviour: block toggles, spine index, counters, read progress. */
import { qs, qsa, el, clamp } from './util.js';
import { TICKER_LINES } from './config.js';
import { sfx } from './audio.js';
import { state } from './state.js';

const BAR_OFFSET = 78;

export function initLore() {
  const blocks = qsa('.blk');
  const spineList = qs('#spine-list');

  /* ---- spine index ---- */
  if (spineList) {
    spineList.replaceChildren();
    blocks.forEach((block) => {
      const num = block.dataset.num || '';
      const nav = block.dataset.nav || '';
      spineList.append(el('li', {},
        el('a', {
          href: `#${block.id}`,
          'data-target': block.id,
          title: `${num} · ${nav}`,
          onclick: (event) => {
            event.preventDefault();
            scrollToBlock(block);
          },
        }, num),
      ));
    });
  }

  /* ---- per-block toggles ---- */
  blocks.forEach((block) => {
    const btn = qs('.blk__toggle', block);
    const label = btn ? qs('.blk__toggle-txt', btn) : null;
    const body = qs('.blk__body', block);

    block.classList.add('is-open');

    const setOpen = (open, quiet = false) => {
      block.classList.toggle('is-open', open);
      block.classList.toggle('is-closed', !open);
      if (btn) btn.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'ย่อ' : 'ขยาย';
      if (body) body.setAttribute('aria-hidden', String(!open));
      if (!quiet) sfx.click();
    };

    if (btn) {
      btn.addEventListener('click', () => setOpen(!block.classList.contains('is-open')));
    }
    const head = qs('.blk__head', block);
    if (head) {
      head.addEventListener('click', (event) => {
        if (event.target.closest('.blk__toggle')) return;
        setOpen(!block.classList.contains('is-open'));
      });
    }
    setOpen(true, true);
  });

  /* ---- bulk controls ---- */
  const expandAll = qs('#expand-all');
  const collapseAll = qs('#collapse-all');
  const applyAll = (open) => {
    blocks.forEach((block) => {
      const btn = qs('.blk__toggle', block);
      const label = btn ? qs('.blk__toggle-txt', btn) : null;
      const body = qs('.blk__body', block);
      block.classList.toggle('is-open', open);
      block.classList.toggle('is-closed', !open);
      if (btn) btn.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'ย่อ' : 'ขยาย';
      if (body) body.setAttribute('aria-hidden', String(!open));
    });
    sfx.click();
  };
  if (expandAll) expandAll.addEventListener('click', () => applyAll(true));
  if (collapseAll) collapseAll.addEventListener('click', () => applyAll(false));

  /* ---- counters ---- */
  const count = qs('#lore-count');
  if (count) {
    const rows = qsa('.row', qs('#lore'));
    count.textContent = `${blocks.length} หัวข้อ · ${rows.length} รายการ`;
  }

  /* ---- ticker ---- */
  const ticker = qs('#filebar-ticker');
  if (ticker) {
    const text = TICKER_LINES.map((line) => ` ${line} `).join('◆');
    ticker.textContent = `${text}◆${text}◆`;
  }

  /* ---- hero counters ---- */
  const heroStats = qsa('.stat dd[data-count]');
  if (heroStats.length) {
    const run = () => {
      heroStats.forEach((dd) => {
        const target = Number(dd.dataset.count || 0);
        const span = qs('span', dd);
        if (!span) return;
        const duration = 1200;
        const start = performance.now();
        const tick = (now) => {
          const t = clamp((now - start) / duration, 0, 1);
          const eased = 1 - (1 - t) ** 3;
          span.textContent = String(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tick);
          else span.textContent = String(target);
        };
        requestAnimationFrame(tick);
      });
    };
    const hero = qs('#hero');
    if (hero && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { run(); io.disconnect(); }
        });
      }, { threshold: 0.25 });
      io.observe(hero);
    } else {
      run();
    }
  }

  /* ---- hero emblem flicker on hover ---- */
  const emblem = qs('#hero-emblem');
  const emblemImg = qs('#hero-emblem-img');
  if (emblem && emblemImg) {
    const limeSrc = emblemImg.dataset.srcLime;
    const redSrc = emblemImg.dataset.srcRed;
    // warm both frames so the strobe never blinks on a decode
    [limeSrc, redSrc].forEach((src) => { const pre = new Image(); pre.src = src; });

    let flip = null;
    let red = false;
    let lastMove = -1e9;
    window.addEventListener('pointermove', () => { lastMove = performance.now(); }, { passive: true });
    const paint = () => {
      emblemImg.src = red ? redSrc : limeSrc;
      emblem.classList.toggle('is-red', red);
    };

    emblem.addEventListener('pointerenter', () => {
      // ignore the case where the emblem simply appears under a parked cursor
      if (performance.now() - lastMove > 600) return;
      emblem.classList.add('is-flicker');
      flip = window.setInterval(() => { red = !red; paint(); }, 110);
    });
    emblem.addEventListener('pointerleave', () => {
      emblem.classList.remove('is-flicker');
      window.clearInterval(flip);
      red = false;
      paint();
    });
    emblem.addEventListener('click', () => {
      red = !red;
      paint();
      sfx.strobe();
    });
  }

  /* ---- scroll helpers ---- */
  const heroRead = qs('#hero-read');
  if (heroRead) {
    heroRead.addEventListener('click', () => {
      sfx.click();
      const lore = qs('#lore');
      if (lore) window.scrollTo({ top: lore.offsetTop - BAR_OFFSET, behavior: 'smooth' });
    });
  }
  const jumpTop = qs('#jump-top');
  if (jumpTop) {
    jumpTop.addEventListener('click', () => {
      sfx.click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- read progress + active spine link ---- */
  const progress = qs('#read-progress');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      if (progress) progress.style.width = `${(pct * 100).toFixed(1)}%`;

      let activeId = null;
      blocks.forEach((block) => {
        if (block.getBoundingClientRect().top <= BAR_OFFSET + 60) activeId = block.id;
      });
      qsa('#spine-list a').forEach((a) => {
        a.classList.toggle('is-active', a.dataset.target === activeId);
      });
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function scrollToBlock(block) {
  sfx.click();
  const top = block.getBoundingClientRect().top + window.scrollY - BAR_OFFSET;
  window.scrollTo({ top, behavior: 'smooth' });
  if (!block.classList.contains('is-open')) {
    const btn = qs('.blk__toggle', block);
    if (btn) window.setTimeout(() => btn.click(), 420);
  }
}

export function refreshLoreForTheme() {
  void state;
}
