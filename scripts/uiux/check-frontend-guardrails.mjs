#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const singleFile = argValue('--file');
const base = argValue('--base') || process.env.UIUX_BASE_REF;

function git(args, fallback = '') {
  try { return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim(); }
  catch { return fallback; }
}

function changedFiles() {
  if (singleFile) return [path.relative(root, path.resolve(singleFile)).replaceAll('\\', '/')];
  const files = new Set();
  if (base) {
    git(['diff', '--name-only', `${base}...HEAD`]).split('\n').filter(Boolean).forEach(f => files.add(f));
  } else {
    git(['diff', '--name-only', 'HEAD']).split('\n').filter(Boolean).forEach(f => files.add(f));
    git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean).forEach(f => files.add(f));
  }
  return [...files];
}

function addedLines(file) {
  const absolute = path.join(root, file);
  const tracked = git(['ls-files', '--error-unmatch', file], '__NO__') !== '__NO__';
  if (!tracked && fs.existsSync(absolute)) return fs.readFileSync(absolute, 'utf8').split('\n');
  const range = base ? [`${base}...HEAD`, '--', file] : ['HEAD', '--', file];
  const diff = git(['diff', '--unified=0', ...range]);
  return diff.split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++')).map(line => line.slice(1));
}

const relevantFiles = changedFiles().filter(file =>
  /^(packages\/frontend\/|e2e\/)/.test(file) && /\.(tsx?|jsx?|css|scss)$/.test(file)
);
if (relevantFiles.length === 0) process.exit(0);

const errors = [];
const warnings = [];
const tokenFiles = [
  'packages/frontend/src/styles/tokens.css',
  'packages/frontend/tailwind.config.js',
  'packages/frontend/tailwind.config.ts'
];

const paletteClass = /\b(?:bg|text|border|ring|from|via|to)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;
const arbitraryUtility = /\b[a-z][a-z0-9-]*-\[[^\]]+\]/i;
const rawColor = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\s*\(/;
const nativeDialog = /\b(?:window\.)?(?:alert|confirm|prompt)\s*\(/;
const rawStatus = /\b(?:PENDING_CONFIRMATION|FULLY_BOOKED|CANCELLED_BY_STUDENT|CANCELLED_BY_PROFESSOR)\b/;
const leakedKey = /\b(?:spanish_levels|class_types|booking_status|notifications)\.[A-Za-z0-9_.-]+\b/;

for (const file of relevantFiles) {
  const lines = addedLines(file);
  lines.forEach((line, index) => {
    const location = `${file} (added line ${index + 1})`;
    if (!tokenFiles.includes(file) && rawColor.test(line)) errors.push(`${location}: raw color value; use a semantic token.`);
    if (!tokenFiles.includes(file) && paletteClass.test(line)) errors.push(`${location}: direct Tailwind palette class; use a semantic class/token.`);
    if (arbitraryUtility.test(line) && !line.includes('uiux-allow-arbitrary')) errors.push(`${location}: arbitrary Tailwind value; add or reuse a token.`);
    if (nativeDialog.test(line)) errors.push(`${location}: native alert/confirm/prompt is forbidden; use the shared feedback/dialog pattern.`);
    if (rawStatus.test(line) && !/status-map|statusMap|bookingStatus/i.test(file)) errors.push(`${location}: backend status must be mapped to user language centrally.`);
    if (leakedKey.test(line) && /[>{'"`]/.test(line)) warnings.push(`${location}: possible visible localization key leak.`);
    if (/style=\{\{/.test(line) && /(color|background|padding|margin|borderRadius|fontSize)\s*:/.test(line)) warnings.push(`${location}: visual inline style may bypass tokens.`);
  });
}

if (warnings.length) {
  console.warn('\nUI/UX guardrail warnings:\n' + warnings.map(x => `  - ${x}`).join('\n'));
}
if (errors.length) {
  console.error('\nUI/UX guardrail violations:\n' + errors.map(x => `  - ${x}`).join('\n'));
  process.exit(1);
}
console.log(`UI/UX guardrails passed for ${relevantFiles.length} changed frontend file(s).`);
