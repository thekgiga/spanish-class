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

// Paths under scripts/uiux/ that are part of the guardrail system itself and
// may be written during guardrail-maintenance tasks.
const allowedPaths = [
  '/scripts/uiux/session-baseline.mjs',
  '/scripts/uiux/tests/',
];

const isAllowed = allowedPaths.some(p => normalized.includes(p));
if (!isAllowed && protectedPaths.some((fragment) => normalized.includes(fragment))) {
  console.error('BLOCKED: UI/UX enforcement files may not be changed during a normal feature task. Use a dedicated guardrail task and start Claude Code with UIUX_ALLOW_GUARDRAIL_EDIT=1.');
  process.exit(2);
}
