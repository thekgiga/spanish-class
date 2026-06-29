#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';

const root = process.cwd();
const completionGate = process.argv.includes('--completion-gate');

function git(args, fallback = '') {
  try { return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim(); }
  catch { return fallback; }
}
function allChanged() {
  const files = new Set();
  git(['diff', '--name-only', 'HEAD']).split('\n').filter(Boolean).forEach(f => files.add(f));
  git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean).forEach(f => files.add(f));
  return [...files];
}
function run(label, command, args) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: process.env });
  if (result.status !== 0) {
    console.error(`${label} failed.`);
    process.exit(result.status ?? 1);
  }
}

const changed = allChanged();
const sourceChanged = changed.some(f => /^packages\/frontend\/(src\/|index\.html|vite\.config|tailwind\.config)/.test(f));
if (completionGate && !sourceChanged) {
  console.log('No changed frontend source files; completion gate skipped.');
  process.exit(0);
}

if (!fs.existsSync(path.join(root, 'node_modules'))) {
  console.error('Dependencies are missing. Run npm install before claiming frontend completion.');
  process.exit(1);
}

run('Changed-line UI/UX guardrails', process.execPath, ['scripts/uiux/check-frontend-guardrails.mjs']);
run('Frontend typecheck', 'npm', ['--prefix', 'packages/frontend', 'run', 'typecheck']);
run('Frontend lint', 'npm', ['--prefix', 'packages/frontend', 'run', 'lint']);
run('Frontend build', 'npm', ['--prefix', 'packages/frontend', 'run', 'build']);

if (sourceChanged) {
  const matrixChanged = changed.includes('docs/redesign/implementation-matrix.csv');
  const evidenceChanged = changed.some(f => /^docs\/redesign\/evidence\/(?!README|TEMPLATE)/.test(f));
  if (!matrixChanged) {
    console.error('Completion blocked: frontend source changed but implementation-matrix.csv was not updated.');
    process.exit(1);
  }
  if (!evidenceChanged) {
    console.error('Completion blocked: frontend source changed but no task evidence file was added or updated.');
    process.exit(1);
  }
}

console.log('\nFrontend verification passed. Browser E2E and visual checks must also be run when required by the affected flow or CI variables.');
