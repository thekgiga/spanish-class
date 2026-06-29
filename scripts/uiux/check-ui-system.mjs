#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const required = [
  'docs/ui-system/design-tokens.json',
  'packages/frontend/src/styles/ui-system.tokens.css',
  'packages/frontend/ui-system.tailwind.extend.cjs',
  'packages/frontend/src/lib/ui-system/status.ts',
  '.claude/skills/spanish-class-ui-system/SKILL.md',
];

const missing = required.filter(file => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error('Missing canonical UI-system files:\n' + missing.map(x => `  - ${x}`).join('\n'));
  process.exit(1);
}

const tokens = JSON.parse(fs.readFileSync(path.join(root, 'docs/ui-system/design-tokens.json'), 'utf8'));
for (const theme of ['light', 'dark']) {
  if (!tokens.color?.[theme]?.brand || !tokens.color?.[theme]?.canvas || !tokens.color?.[theme]?.fgPrimary) {
    console.error(`Incomplete ${theme} semantic color theme.`);
    process.exit(1);
  }
}

try {
  execFileSync(process.execPath, [path.join(root, 'scripts/uiux/check-token-contrast.mjs')], { cwd: root, stdio: 'inherit' });
} catch { process.exit(1); }

let output = '';
try {
  output = execFileSync(process.execPath, [path.join(root, 'scripts/uiux/check-frontend-guardrails.mjs')], { cwd: root, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] });
} catch (error) {
  process.stderr.write(error.stderr || error.stdout || String(error));
  process.exit(1);
}
process.stdout.write(output);
try {
  execFileSync(process.execPath, [path.join(root, 'scripts/uiux/check-canonical-stories.mjs')], { cwd: root, stdio: 'inherit' });
} catch { process.exit(1); }
console.log('Complete UI-system integrity check passed.');
