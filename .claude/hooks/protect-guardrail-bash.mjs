import process from 'node:process';

let input = '';
for await (const chunk of process.stdin) input += chunk;
let payload = {};
try { payload = JSON.parse(input || '{}'); } catch { process.exit(0); }
if (process.env.UIUX_ALLOW_GUARDRAIL_EDIT === '1') process.exit(0);
const command = payload?.tool_input?.command || '';
const protectedFragments = [
  '.claude/settings.json',
  '.claude/rules/frontend/',
  '.claude/skills/spanish-class-ui-ux-guardian/',
  '.claude/agents/ui-ux-reviewer.md',
  'scripts/uiux/',
  '.github/workflows/frontend-quality.yml',
  'docs/product/processes-overview.md'
];
const mutation = /(?:^|[;&|]\s*|\s)(?:rm|mv|cp|sed|perl|python|node|cat|echo|printf|tee|truncate|touch|chmod|git\s+(?:checkout|restore|clean)|apply_patch)\b/i;
if (mutation.test(command) && protectedFragments.some(fragment => command.includes(fragment))) {
  console.error('BLOCKED: this Bash command may mutate protected UI/UX enforcement files. Use a dedicated guardrail task with UIUX_ALLOW_GUARDRAIL_EDIT=1.');
  process.exit(2);
}
