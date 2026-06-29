import process from 'node:process';

let input = '';
for await (const chunk of process.stdin) input += chunk;
let payload = {};
try { payload = JSON.parse(input || '{}'); } catch { process.exit(0); }
if (process.env.UIUX_ALLOW_GUARDRAIL_EDIT === '1') process.exit(0);
const file = (payload?.file_path || '').replaceAll('\\', '/');
const protectedChange = payload?.source === 'project_settings' ||
  (payload?.source === 'skills' && file.includes('/spanish-class-ui-ux-guardian/'));
if (protectedChange) {
  console.error('BLOCKED: project UI/UX settings or the guardian skill changed without UIUX_ALLOW_GUARDRAIL_EDIT=1.');
  process.exit(2);
}
