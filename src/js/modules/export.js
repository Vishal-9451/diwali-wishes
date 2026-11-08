import { canvasToBlob, downloadBlob, slug, isSmallScreen } from '../utils/helpers.js';
import { CARD_SIZE, CARD_FONTS } from '../utils/constants.js';

/** Wait for web fonts (including Devanagari glyphs) so the export matches the preview. */
async function waitForFonts(sampleText) {
  if (!document.fonts) return;
  const sample = `${sampleText} शुभ दीपावली Happy Diwali`;
  const loads = [];
  CARD_FONTS.forEach((f) => {
    const family = f.css.split(',')[0].trim();
    loads.push(document.fonts.load(`400 24px ${family}`, sample).catch(() => []));
    loads.push(document.fonts.load(`600 24px ${family}`, sample).catch(() => []));
  });
  loads.push(document.fonts.load('400 24px "Noto Serif Devanagari"', 'शुभ दीपावली').catch(() => []));
  await Promise.all(loads);
  await document.fonts.ready;
}

async function waitForImages(root) {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(imgs.map((img) => (img.complete ? Promise.resolve() : new Promise((r) => { img.onload = img.onerror = r; }))));
}

/** Render the greeting card element into a high-resolution canvas. */
export async function renderCardCanvas(cardEl) {
  if (!cardEl) throw new Error('The greeting card could not be found.');
  await waitForFonts(cardEl.textContent || '');
  await waitForImages(cardEl);
  let html2canvas;
  try {
    ({ default: html2canvas } = await import('html2canvas'));
  } catch {
    throw new Error('The export library failed to load. Check your connection and try again.');
  }
  const scale = isSmallScreen() ? 2 : 3;
  const canvas = await html2canvas(cardEl, {
    scale,
    width: CARD_SIZE.width,
    height: CARD_SIZE.height,
    backgroundColor: null,
    useCORS: true,
    logging: false,
    onclone: (doc) => {
      // The on-screen preview is scaled with CSS; export at the true 600x800 size.
      const scaler = doc.getElementById('card-scaler');
      if (scaler) { scaler.style.transform = 'none'; scaler.style.width = `${CARD_SIZE.width}px`; scaler.style.height = `${CARD_SIZE.height}px`; }
      const stage = doc.getElementById('card-stage');
      if (stage) { stage.style.height = `${CARD_SIZE.height}px`; stage.style.overflow = 'visible'; }
    },
  });
  if (!canvas.width || !canvas.height) throw new Error('The card rendered empty. Try again.');
  return canvas;
}

export async function downloadCardPng(cardEl, name) {
  const canvas = await renderCardCanvas(cardEl);
  const blob = await canvasToBlob(canvas, 'image/png');
  downloadBlob(blob, `diwali-card-${slug(name)}.png`);
  return { width: canvas.width, height: canvas.height };
}

export async function downloadCardPdf(cardEl, name) {
  const canvas = await renderCardCanvas(cardEl);
  let jsPDF;
  try {
    ({ jsPDF } = await import('jspdf'));
  } catch {
    throw new Error('The PDF library failed to load. Check your connection and try again.');
  }
  // 600x800 px page (3:4), image is the 2-3x high-resolution render.
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [CARD_SIZE.width, CARD_SIZE.height], compress: true, hotfixes: ['px_scaling'] });
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, CARD_SIZE.width, CARD_SIZE.height, undefined, 'FAST');
  pdf.setProperties({ title: 'Diwali Wishes greeting card', creator: 'Diwali Wishes' });
  pdf.save(`diwali-card-${slug(name)}.pdf`);
  return { width: canvas.width, height: canvas.height };
}
