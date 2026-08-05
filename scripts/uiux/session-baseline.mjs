// scripts/uiux/session-baseline.mjs
//
// Re-exports the session-baseline helpers from .claude/hooks/session-baseline.mjs
// so that both the hooks and any scripts/uiux/* tooling can import from a
// consistent location relative to each caller.
//
// The canonical implementation lives in .claude/hooks/session-baseline.mjs.

export * from '../../.claude/hooks/session-baseline.mjs';
