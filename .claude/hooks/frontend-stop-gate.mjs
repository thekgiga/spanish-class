import { spawnSync } from 'node:child_process';
import path from 'node:path';

let input = '';
for await (const chunk of process.stdin) input += chunk;
let payload = {};
try { payload = JSON.parse(input || '{}'); } catch {}
if (payload?.stop_hook_active) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const result = spawnSync(process.execPath, [path.join(root, 'scripts/uiux/frontend-verify.mjs'), '--completion-gate'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env
});
process.exit(result.status === 0 ? 0 : 2);
