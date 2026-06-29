import path from 'node:path';

let input = '';
for await (const chunk of process.stdin) input += chunk;
let payload = {};
try { payload = JSON.parse(input || '{}'); } catch { process.exit(0); }

const candidate = payload?.tool_input?.file_path || payload?.tool_input?.path || '';
if (!candidate || process.env.UIUX_ALLOW_GUARDRAIL_EDIT === '1') process.exit(0);

const normalized = ('/' + candidate.replaceAll('\\', '/')).replaceAll('//', '/');
const protectedPaths = [
  '/.claude/settings.json',
  '/.claude/rules/frontend/',
  '/.claude/skills/spanish-class-ui-ux-guardian/',
  '/.claude/agents/ui-ux-reviewer.md',
  '/scripts/uiux/',
  '/.github/workflows/frontend-quality.yml',
  '/docs/product/processes-overview.md'
];

if (protectedPaths.some((fragment) => normalized.includes(fragment))) {
  console.error('BLOCKED: UI/UX enforcement files may not be changed during a normal feature task. Use a dedicated guardrail task and start Claude Code with UIUX_ALLOW_GUARDRAIL_EDIT=1.');
  process.exit(2);
}
