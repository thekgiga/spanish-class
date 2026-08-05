import { spawnSync } from 'node:child_process';
import path from 'node:path';

let input = '';
for await (const chunk of process.stdin) input += chunk;
let payload = {};
try { payload = JSON.parse(input || '{}'); } catch { process.exit(0); }
const file = payload?.tool_input?.file_path || payload?.tool_input?.path || '';
if (!file) process.exit(0);
const normalized = ('/' + file.replaceAll('\\', '/')).replaceAll('//', '/');
const relevant = normalized.includes('/packages/frontend/') || normalized.includes('/e2e/');
if (!relevant) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const result = spawnSync(process.execPath, [path.join(root, 'scripts/uiux/check-frontend-guardrails.mjs'), '--file', file], {
  cwd: root,
  stdio: 'inherit',
  env: process.env
});
process.exit(result.status === 0 ? 0 : 2);
