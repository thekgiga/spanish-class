import fs from 'node:fs';
import path from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const phasePath = path.join(root, 'docs/redesign/current-phase.md');
let phase = 'UI/UX redesign ledger not found.';
if (fs.existsSync(phasePath)) {
  const text = fs.readFileSync(phasePath, 'utf8');
  phase = text.split('\n').slice(0, 24).join('\n');
}
console.log(`Spanish Class UI/UX enforcement is active.\n\n${phase}\n\nFor frontend work, load the spanish-class-ui-ux-guardian skill and update the implementation matrix before completion.`);

console.log('UI source of truth: docs/ui-system/README.md and design-tokens.json. Load spanish-class-ui-system for every frontend UI change.');
