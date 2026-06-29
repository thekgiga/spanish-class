import fs from 'node:fs';
import path from 'node:path';
import { writeBaseline, computeCurrentState } from './session-baseline.mjs';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const sessionId = process.env.CLAUDE_SESSION_ID || `fallback-${process.pid}`;

// Write the session baseline snapshot so the stop gate can diff against it.
try {
  const files = computeCurrentState(root);
  writeBaseline(root, sessionId, { created: new Date().toISOString(), files });
} catch (err) {
  // Non-fatal — the stop gate degrades gracefully to the git fallback.
  process.stderr.write(`[session-context] baseline write failed: ${err.message}\n`);
}

const phasePath = path.join(root, 'docs/redesign/current-phase.md');
let phase = 'UI/UX redesign ledger not found.';
if (fs.existsSync(phasePath)) {
  const text = fs.readFileSync(phasePath, 'utf8');
  phase = text.split('\n').slice(0, 24).join('\n');
}
console.log(`Spanish Class UI/UX enforcement is active.\n\n${phase}\n\nFor frontend work, load the spanish-class-ui-ux-guardian skill and update the implementation matrix before completion.`);
console.log('UI source of truth: docs/ui-system/README.md and design-tokens.json. Load spanish-class-ui-system for every frontend UI change.');
