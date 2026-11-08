import { svgEl } from './helpers.js';

const GOLD = '#D6A84D';
const CHAMP = '#F5CC75';

/** Decorative rangoli built with safe SVG DOM APIs. `rings` controls the detail level. */
export function makeRangoli({ rings = 4, petals = 12, className = '' } = {}) {
  const svg = svgEl('svg', { viewBox: '-125 -125 250 250', class: `rangoli-svg ${className}`.trim(), 'aria-hidden': 'true', focusable: 'false' });
  const defs = svgEl('defs');
  const grad = svgEl('radialGradient', { id: `rg-${Math.random().toString(36).slice(2, 8)}` });
  grad.append(svgEl('stop', { offset: '0', 'stop-color': CHAMP, 'stop-opacity': '0.9' }), svgEl('stop', { offset: '1', 'stop-color': GOLD, 'stop-opacity': '0.5' }));
  defs.append(grad);
  svg.append(defs);
  const g = svgEl('g', { fill: 'none', stroke: `url(#${grad.id})`, 'stroke-width': '0.6', 'stroke-linecap': 'round' });
  for (let r = 0; r < rings; r += 1) {
    const radius = 20 + r * 18;
    const n = petals + r * 4;
    const len = 14 + r * 2;
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * 360 + (r % 2 ? 180 / n : 0);
      const petal = svgEl('path', {
        d: `M0 ${-radius} C ${len * 0.55} ${-radius - len * 0.45}, ${len * 0.55} ${-radius - len * 0.95}, 0 ${-radius - len} C ${-len * 0.55} ${-radius - len * 0.95}, ${-len * 0.55} ${-radius - len * 0.45}, 0 ${-radius}Z`,
        transform: `rotate(${a.toFixed(2)})`,
      });
      g.append(petal);
    }
    g.append(svgEl('circle', { r: radius - 3, 'stroke-dasharray': '1 4', opacity: '0.8' }));
  }
  g.append(svgEl('circle', { r: 3, fill: CHAMP, stroke: 'none', opacity: '0.6' }));
  svg.append(g);
  return svg;
}

/** Flat SVG diya with a flickering CSS flame. */
export function makeDiya({ className = '' } = {}) {
  const svg = svgEl('svg', { viewBox: '0 0 120 100', class: `diya-svg ${className}`.trim(), 'aria-hidden': 'true', focusable: 'false' });
  const defs = svgEl('defs');
  const bowl = svgEl('linearGradient', { id: `bw-${Math.random().toString(36).slice(2, 8)}`, x1: '0', y1: '0', x2: '0', y2: '1' });
  bowl.append(svgEl('stop', { offset: '0', 'stop-color': CHAMP }), svgEl('stop', { offset: '1', 'stop-color': '#9B6F1E' }));
  const flame = svgEl('radialGradient', { id: `fl-${Math.random().toString(36).slice(2, 8)}`, cx: '50%', cy: '70%', r: '60%' });
  flame.append(svgEl('stop', { offset: '0', 'stop-color': '#FFF8EB' }), svgEl('stop', { offset: '0.45', 'stop-color': CHAMP }), svgEl('stop', { offset: '1', 'stop-color': '#F08A24', 'stop-opacity': '0.2' }));
  defs.append(bowl, flame);
  svg.append(defs);
  svg.append(svgEl('ellipse', { cx: 60, cy: 40, rx: 34, ry: 30, class: 'diya-glow', fill: CHAMP, opacity: '0.18' }));
  svg.append(svgEl('path', { d: 'M60 8C70 22 76 30 66 44c-2.800 4-9.200 4-12 0C44 30 50 22 60 8z', fill: `url(#${flame.id})`, class: 'diya-flame' }));
  svg.append(svgEl('path', { d: 'M14 50h92c0 22-20 38-46 38S14 72 14 50z', fill: `url(#${bowl.id})` }));
  svg.append(svgEl('path', { d: 'M14 50c14-6 78-6 92 0', fill: 'none', stroke: '#FFF8EB', 'stroke-opacity': '0.5', 'stroke-width': '1.200' }));
  svg.append(svgEl('ellipse', { cx: 60, cy: 92, rx: 26, ry: 4, fill: '#000', opacity: '0.25' }));
  return svg;
}
