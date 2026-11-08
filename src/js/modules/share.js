import { $, copyText, toast, canvasToBlob, downloadBlob, slug } from '../utils/helpers.js';
import { getState } from '../state.js';
import { buildShareUrl } from '../utils/validation.js';

export function createShare(root, { onCard, onRestart }) {
  const text = $('#share-text', root);
  const urlIn = $('#share-url', root);
  const qr = $('#qr-canvas', root);
  const qrErr = $('#qr-error', root);
  const qrBtn = $('#qr-download', root);
  let url = '';
  let QR = null;

  const message = () => `${getState().wish.text}\n\n${url}`;

  async function drawQr(canvas, width) {
    if (!QR) QR = (await import('qrcode')).default;
    await QR.toCanvas(canvas, url, { width, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#160D2C', light: '#FFF8EB' } });
  }

  async function enter() {
    const s = getState();
    url = buildShareUrl(s);
    text.textContent = s.wish.text;
    text.setAttribute('lang', s.language === 'hi' ? 'hi' : 'en');
    urlIn.value = url;
    qrErr.textContent = '';
    qrBtn.disabled = true;
    try {
      await drawQr(qr, 220);
      qrBtn.disabled = false;
    } catch (err) {
      console.error(err);
      qrErr.textContent = 'The QR code could not be created for this link.';
    }
  }

  $('#share-wa', root).addEventListener('click', () => {
    const link = `https://wa.me/?text=${encodeURIComponent(message())}`;
    const win = window.open(link, '_blank', 'noopener,noreferrer');
    if (!win) toast('Your browser blocked the WhatsApp window. Allow pop-ups or use Copy link.', 'error');
  });

  $('#share-native', root).addEventListener('click', async () => {
    const s = getState();
    const data = { title: 'Diwali Wishes', text: s.wish.text, url };
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return; // person closed the share sheet
      }
    }
    const ok = await copyText(message());
    toast(ok ? 'Sharing is not available here, so the wish and link were copied instead.' : 'Sharing is not available. Select the link and copy it manually.', ok ? 'info' : 'error');
  });

  $('#share-copy-wish', root).addEventListener('click', async () => {
    const ok = await copyText(getState().wish.text);
    toast(ok ? 'Wish copied.' : 'Could not copy automatically.', ok ? 'info' : 'error');
  });
  $('#share-copy-url', root).addEventListener('click', async () => {
    const ok = await copyText(url);
    if (!ok) urlIn.select();
    toast(ok ? 'Link copied.' : 'Could not copy automatically - the link is selected, press Ctrl/Cmd+C.', ok ? 'info' : 'error');
  });
  urlIn.addEventListener('focus', () => urlIn.select());

  qrBtn.addEventListener('click', async () => {
    try {
      const big = document.createElement('canvas');
      await drawQr(big, 1024);
      downloadBlob(await canvasToBlob(big, 'image/png'), `diwali-wish-qr-${slug(getState().recipient)}.png`);
      toast('QR code downloaded.');
    } catch (err) {
      toast(`Could not download the QR code: ${err.message}`, 'error');
    }
  });

  $('#share-card', root).addEventListener('click', () => onCard?.());
  $('#share-restart', root).addEventListener('click', () => onRestart?.());

  return { enter };
}
