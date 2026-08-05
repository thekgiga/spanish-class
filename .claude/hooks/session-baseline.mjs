#!/usr/bin/env node
/**
 * session-baseline.mjs
 *
 * Shared helpers for session-scoped change detection and phase-aware
 * completion gating.
 *
 * Imported by:
 *   - .claude/hooks/session-context.mjs   (SessionStart — writes baseline)
 *   - .claude/hooks/frontend-stop-gate.mjs (Stop/TaskCompleted — reads + checks)
 *   - scripts/uiux/tests/test-stop-gate.sh (via node inline invocations)
 *
 * Baseline stored at .git/claude-session-<id>.json — inside .git/ so it
 * never dirties the working tree and is automatically excluded from git.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// ---------------------------------------------------------------------------
// Baseline file management
// ---------------------------------------------------------------------------

export function baselinePath(root, sessionId) {
  const safe = (sessionId || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
  return path.join(root, '.git', `claude-session-${safe}.json`);
}

export function readBaseline(root, sessionId) {
  const p = baselinePath(root, sessionId);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return null; }
}

export function writeBaseline(root, sessionId, data) {
  const p = baselinePath(root, sessionId);
  const gitDir = path.dirname(p);
  if (!fs.existsSync(gitDir)) return; // not a git repo — skip silently
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

// ---------------------------------------------------------------------------
// File-state computation
// ---------------------------------------------------------------------------

export const MONITORED_GLOBS = [
  'packages/frontend/src',
  'packages/frontend/tailwind.config.js',
  'packages/frontend/ui-system.tailwind.extend.cjs',
  'packages/frontend/tests',
  'docs/redesign',
];

function walkDir(dir, root, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, root, out);
    else if (entry.isFile()) out.push(path.relative(root, full));
  }
  return out;
}

export function computeCurrentState(root) {
  const state = {};
  for (const glob of MONITORED_GLOBS) {
    const full = path.join(root, glob);
    if (!fs.existsSync(full)) continue;
    const st = fs.statSync(full);
    if (st.isFile()) {
      state[path.relative(root, full)] = { mtime: st.mtimeMs, size: st.size };
    } else {
      for (const rel of walkDir(full, root)) {
        const s = fs.statSync(path.join(root, rel));
        state[rel] = { mtime: s.mtimeMs, size: s.size };
      }
    }
  }
  return state;
}

export function diffState(before, after) {
  const added = new Set();
  const modified = new Set();
  const deleted = new Set();
  for (const [p, cur] of Object.entries(after)) {
    if (!(p in before)) added.add(p);
    else if (cur.mtime !== before[p].mtime || cur.size !== before[p].size) modified.add(p);
  }
  for (const p of Object.keys(before)) {
    if (!(p in after)) deleted.add(p);
  }
  return { added, modified, deleted };
}

// ---------------------------------------------------------------------------
// Session-change detection (with git fallback)
// ---------------------------------------------------------------------------

function git(args, cwd) {
  try { return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim(); }
  catch { return ''; }
}

/**
 * Detect which files changed during this session.
 *
 * Primary path: diff current state against the session snapshot stored in
 * .git/claude-session-<id>.json.  Only files that did not exist in the
 * snapshot (added), changed since the snapshot (modified), or were present
 * in the snapshot but are now gone (deleted) are returned.
 *
 * Fallback (no snapshot — pre-fix sessions): git diff + git ls-files.  All
 * discovered files land in `added`.  This preserves the old behaviour so
 * no regression occurs on sessions started without a baseline.
 */
export function detectSessionChanges(root, sessionId) {
  const baseline = readBaseline(root, sessionId);
  if (baseline && baseline.files) {
    const current = computeCurrentState(root);
    return diffState(baseline.files, current);
  }
  // git fallback
  const added = new Set([
    ...git(['diff', '--name-only', 'HEAD'], root).split('\n').filter(Boolean),
    ...git(['ls-files', '--others', '--exclude-standard'], root).split('\n').filter(Boolean),
  ]);
  return { added, modified: new Set(), deleted: new Set() };
}

// ---------------------------------------------------------------------------
// Phase detection
// ---------------------------------------------------------------------------

/**
 * Parse docs/redesign/current-phase.md and return the first non-complete
 * phase.  Returns `{ number, status }`.
 */
export function readActivePhase(root) {
  const phasePath = path.join(root, 'docs/redesign/current-phase.md');
  if (!fs.existsSync(phasePath)) return { number: -1, status: 'unknown' };

  const text = fs.readFileSync(phasePath, 'utf8');
  // Match "## Phase N — ..." blocks, each spanning until the next "## Phase"
  // or end of string.  The 's' (dotAll) flag is unavailable in older Node;
  // use [\s\S] instead.
  const phaseRe = /^## Phase (\d+)[^\n]*\n([\s\S]*?)(?=^## Phase|\Z)/gm;
  const blocks = [...text.matchAll(phaseRe)];

  for (const [, numStr, body] of blocks) {
    const statusMatch = body.match(/^\*\*Status:\*\*\s*(.+)/m);
    const status = statusMatch ? statusMatch[1].trim() : 'unknown';
    if (!/complete/i.test(status)) {
      return { number: parseInt(numStr, 10), status };
    }
  }

  // All phases marked complete — return the last one.
  if (blocks.length) {
    const last = blocks[blocks.length - 1];
    const sm = last[2].match(/^\*\*Status:\*\*\s*(.+)/m);
    return { number: parseInt(last[1], 10), status: sm ? sm[1].trim() : 'complete' };
  }
  return { number: -1, status: 'unknown' };
}

// ---------------------------------------------------------------------------
// Phase requirement checks
// ---------------------------------------------------------------------------

/**
 * Check whether work done this session satisfies the active-phase
 * requirements.  Only fires when changed files actually belong to that
 * phase's scope; if no relevant files changed the gate passes silently.
 *
 * @returns {{ pass: boolean, blockers: string[] }}
 */
export function checkPhaseRequirements(root, phase, changes) {
  const allChanged = new Set([...changes.added, ...changes.modified]);
  if (allChanged.size === 0) return { pass: true, blockers: [] };

  if (phase.number === 0) return checkPhase0(root, allChanged);
  if (phase.number === 1) return checkPhase1(root, allChanged);

  // Phases ≥ 2: no requirements defined yet — never block.
  return { pass: true, blockers: [] };
}

// ── Phase 0 ────────────────────────────────────────────────────────────────

function checkPhase0(root, allChanged) {
  const phase0Prefixes = [
    'docs/redesign/',
    'packages/frontend/tests/e2e/baseline/',
  ];
  const phase0Touched = [...allChanged].some(p =>
    phase0Prefixes.some(prefix => p.startsWith(prefix))
  );
  if (!phase0Touched) return { pass: true, blockers: [] };

  const blockers = [];
  const exists = rel => fs.existsSync(path.join(root, rel));

  // Umbrella audit document.
  if (!exists('docs/redesign/current-architecture-audit.md')) {
    blockers.push('Missing docs/redesign/current-architecture-audit.md (Phase 0 umbrella audit).');
  }

  // At least one audit appendix.
  const auditDir = path.join(root, 'docs/redesign/audit');
  const hasAuditFiles = fs.existsSync(auditDir) &&
    fs.readdirSync(auditDir).some(f => f.endsWith('.md'));
  if (!hasAuditFiles) {
    blockers.push('No audit appendices found under docs/redesign/audit/ (Phase 0 requirement).');
  }

  // At least one evidence file (not README/TEMPLATE).
  const evidenceDir = path.join(root, 'docs/redesign/evidence');
  const hasEvidence = fs.existsSync(evidenceDir) &&
    fs.readdirSync(evidenceDir).some(f =>
      f.endsWith('.md') && f !== 'README.md' && f !== 'TEMPLATE.md'
    );
  if (!hasEvidence) {
    blockers.push('No evidence file under docs/redesign/evidence/ (Phase 0 requires run evidence).');
  }

  // current-phase.md with at least one checked deliverable.
  const phasePath = path.join(root, 'docs/redesign/current-phase.md');
  if (fs.existsSync(phasePath)) {
    if (!/\[x\]/i.test(fs.readFileSync(phasePath, 'utf8'))) {
      blockers.push('docs/redesign/current-phase.md has no checked [x] deliverables for Phase 0.');
    }
  } else {
    blockers.push('Missing docs/redesign/current-phase.md.');
  }

  // Matrix has at least one P0 row marked Done or Partial.
  const matrixPath = path.join(root, 'docs/redesign/implementation-matrix.csv');
  if (fs.existsSync(matrixPath)) {
    const csv = fs.readFileSync(matrixPath, 'utf8');
    if (!/^P0-[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,(?:Done|Partial)/im.test(csv)) {
      blockers.push('implementation-matrix.csv has no Phase 0 rows marked Done or Partial.');
    }
  } else {
    blockers.push('Missing docs/redesign/implementation-matrix.csv.');
  }

  return { pass: blockers.length === 0, blockers };
}

// ── Phase 1 ────────────────────────────────────────────────────────────────

function checkPhase1(root, allChanged) {
  const phase1Prefixes = [
    'packages/frontend/src/',
    'packages/frontend/tailwind.config.js',
    'packages/frontend/ui-system.tailwind.extend.cjs',
  ];
  const phase1Touched = [...allChanged].some(p =>
    phase1Prefixes.some(prefix => p.startsWith(prefix))
  );
  if (!phase1Touched) return { pass: true, blockers: [] };

  const blockers = [];
  const exists = rel => fs.existsSync(path.join(root, rel));
  const read = rel => {
    const full = path.join(root, rel);
    return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
  };

  // Tokens must be imported somewhere.
  const tokensImported =
    read('packages/frontend/src/main.tsx').includes('ui-system.tokens') ||
    read('packages/frontend/src/styles/globals.css').includes('ui-system.tokens');
  if (!tokensImported) {
    blockers.push('ui-system.tokens.css is not imported in main.tsx or globals.css (Phase 1 requirement).');
  }

  // Tailwind config must include semantic tokens.
  const tw = read('packages/frontend/tailwind.config.js');
  if (!/['"]canvas['"]|canvas\s*:/.test(tw)) {
    blockers.push('tailwind.config.js does not contain the semantic "canvas" token (Phase 1 requirement).');
  }

  // status.ts must export something.
  const statusTs = read('packages/frontend/src/lib/ui-system/status.ts');
  if (statusTs) {
    if (!/export\s+(const|function|default)/.test(statusTs)) {
      blockers.push('packages/frontend/src/lib/ui-system/status.ts has no exports (Phase 1 requirement).');
    }
  } else {
    blockers.push('Missing packages/frontend/src/lib/ui-system/status.ts (Phase 1 requirement).');
  }

  // At least one Storybook story must have changed.
  const storyChanged = [...allChanged].some(p =>
    p.startsWith('packages/frontend/src/components/ui/') && p.includes('.stories.')
  );
  if (!storyChanged) {
    blockers.push('No Storybook story changed under components/ui/ this session (Phase 1 requires state matrix).');
  }

  return { pass: blockers.length === 0, blockers };
}
