#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'docs/ui-system/design-tokens.json');
const tokens = JSON.parse(fs.readFileSync(file, 'utf8'));

function hslToRgb(value) {
  const match = String(value).match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!match) throw new Error(`Invalid HSL channel token: ${value}`);
  let h = Number(match[1]) / 360;
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;
  if (s === 0) return [l, l, l];
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
}
function relativeLuminance(value) {
  return hslToRgb(value).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
}
function ratio(a, b) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const checks = [
  ['light', 'fgPrimary', 'canvas', 7],
  ['light', 'fgSecondary', 'canvas', 4.5],
  ['light', 'fgPrimary', 'surface', 7],
  ['light', 'brandContrast', 'brand', 4.5],
  ['light', 'requestedForeground', 'requestedSurface', 4.5],
  ['light', 'availableForeground', 'availableSurface', 4.5],
  ['light', 'confirmedForeground', 'confirmedSurface', 4.5],
  ['light', 'blockedForeground', 'blockedSurface', 4.5],
  ['light', 'cancelledForeground', 'cancelledSurface', 4.5],
  ['dark', 'fgPrimary', 'canvas', 7],
  ['dark', 'fgSecondary', 'canvas', 4.5],
  ['dark', 'brandContrast', 'brand', 4.5],
  ['dark', 'requestedForeground', 'requestedSurface', 4.5],
  ['dark', 'availableForeground', 'availableSurface', 4.5],
  ['dark', 'confirmedForeground', 'confirmedSurface', 4.5],
];
const failures=[];
for (const [theme, fg, bg, min] of checks) {
  const value=ratio(tokens.color[theme][fg], tokens.color[theme][bg]);
  if (value < min) failures.push(`${theme}.${fg} on ${theme}.${bg}: ${value.toFixed(2)} < ${min}`);
}
if (failures.length) {
  console.error('Token contrast failures:\n' + failures.map(x => `  - ${x}`).join('\n'));
  process.exit(1);
}
console.log(`Token contrast passed (${checks.length} canonical pairs).`);
