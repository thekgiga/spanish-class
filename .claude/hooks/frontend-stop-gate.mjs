import { detectSessionChanges, readActivePhase, checkPhaseRequirements } from './session-baseline.mjs';

let input = '';
for await (const chunk of process.stdin) input += chunk;
let payload = {};
try { payload = JSON.parse(input || '{}'); } catch {}

// Prevent infinite stop-hook loop.
if (payload?.stop_hook_active) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const sessionId = process.env.CLAUDE_SESSION_ID || null;

const changes = detectSessionChanges(root, sessionId);
const phase = readActivePhase(root);
const { pass, blockers } = checkPhaseRequirements(root, phase, changes);

if (!pass) {
  const lines = [
    `Agent hook condition was not met: Phase ${phase.number} completion gate failed.`,
    ...blockers.map(b => `  - ${b}`),
    '',
    'Fix the listed issues and re-run the task.',
  ];
  process.stderr.write(lines.join('\n') + '\n');
  process.exit(2);
}

process.exit(0);
