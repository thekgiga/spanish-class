#!/usr/bin/env bash
# test-stop-gate.sh
#
# Shell tests for the session-baseline / stop-gate system.
# Each test creates an isolated temporary directory acting as a fake repo root,
# exercises session-baseline.mjs functions via node -e, and verifies
# the outcome.
#
# Run from the repository root:
#   bash .claude/hooks/tests/test-stop-gate.sh
#
# The canonical copy under scripts/uiux/tests/test-stop-gate.sh delegates here.

set -euo pipefail

PASS=0
FAIL=0
ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
BASELINE_MOD="$ROOT_DIR/.claude/hooks/session-baseline.mjs"

# ── Helpers ────────────────────────────────────────────────────────────────

assert() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "  PASS: $desc"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $desc"
    echo "        expected: $expected"
    echo "        actual:   $actual"
    FAIL=$((FAIL + 1))
  fi
}

# Create a minimal fake git repo under a temp dir.
make_repo() {
  local dir
  dir="$(mktemp -d)"
  git init -q "$dir"
  git -C "$dir" config user.email "test@test.com"
  git -C "$dir" config user.name "Test"
  mkdir -p "$dir/.git"   # already created by git init
  echo "$dir"
}

# Write a baseline snapshot for session "test-session" into a repo.
write_baseline() {
  local repo="$1"
  local files_json="${2:-{\}}"
  local ts
  ts="$(node -e 'process.stdout.write(new Date().toISOString())')"
  echo "{\"created\":\"$ts\",\"files\":$files_json}" > "$repo/.git/claude-session-test-session.json"
}

# Run the phase-requirements check via node and return exit code.
run_check() {
  local repo="$1"
  local phase_num="$2"
  local phase_status="$3"
  local changed_json="${4:-{\}}"   # JSON object { path: true }

  node --input-type=module <<EOF
import { checkPhaseRequirements } from '${BASELINE_MOD}';

const root = '${repo}';
const phase = { number: ${phase_num}, status: '${phase_status}' };
// Build changes from JSON keys as the "added" set.
const keys = Object.keys(${changed_json});
const changes = { added: new Set(keys), modified: new Set(), deleted: new Set() };

const result = checkPhaseRequirements(root, phase, changes);
if (!result.pass) {
  process.stderr.write('BLOCKERS: ' + result.blockers.join('; ') + '\n');
  process.exit(1);
}
process.exit(0);
EOF
}

# ── Test infrastructure: populate a "complete Phase 0" repo ────────────────

make_complete_phase0_repo() {
  local repo
  repo="$(make_repo)"

  mkdir -p "$repo/docs/redesign/audit"
  mkdir -p "$repo/docs/redesign/evidence"
  mkdir -p "$repo/packages/frontend/tests/e2e/baseline"

  # Umbrella audit.
  echo "# Audit" > "$repo/docs/redesign/current-architecture-audit.md"

  # One appendix.
  echo "# Routes" > "$repo/docs/redesign/audit/01-routes.md"

  # Evidence file.
  echo "# Evidence" > "$repo/docs/redesign/evidence/phase-0-baseline.md"

  # current-phase.md with a checked deliverable and Phase 0 complete / Phase 1 not started.
  cat > "$repo/docs/redesign/current-phase.md" <<'PHASE'
## Phase 0 — Architecture reconnaissance and regression baseline

**Status:** Complete with documented blockers

## Required outputs

- [x] `docs/redesign/current-architecture-audit.md`

---

## Phase 1 — UI system foundation

**Status:** Unblocked, not started
PHASE

  # Matrix with a P0 Done row.
  printf 'ID,Area,Role,Requirement,Priority,Phase,Status,Code,Tests,Evidence,Notes\n' \
    > "$repo/docs/redesign/implementation-matrix.csv"
  printf 'P0-AUD-001,Foundation,Both,Create route inventory,Critical,0,Done,,,,\n' \
    >> "$repo/docs/redesign/implementation-matrix.csv"

  echo "$repo"
}

# ── Pre-existing Phase 1 scaffold files (committed before session) ──────────

make_phase1_scaffold() {
  local repo="$1"
  mkdir -p "$repo/packages/frontend/src/lib/ui-system"
  mkdir -p "$repo/packages/frontend/src/styles"
  echo "// status scaffold" > "$repo/packages/frontend/src/lib/ui-system/status.ts"
  echo "// tokens scaffold" > "$repo/packages/frontend/src/styles/ui-system.tokens.css"
  echo "// extend scaffold" > "$repo/packages/frontend/ui-system.tailwind.extend.cjs"
}

echo "=== Stop-gate test suite ==="
echo ""

# ═══════════════════════════════════════════════════════════════════════════
echo "--- T1: unchanged pre-existing scaffold file is not reported as changed"
# ═══════════════════════════════════════════════════════════════════════════
REPO="$(make_repo)"
make_phase1_scaffold "$REPO"
# Baseline includes the scaffold files at their current mtime+size.
# Then we run detection: nothing changed since baseline.
node --input-type=module <<EOF
import { computeCurrentState, writeBaseline, detectSessionChanges } from '${BASELINE_MOD}';
const root = '${REPO}';
const files = computeCurrentState(root);
writeBaseline(root, 'test-session', { created: new Date().toISOString(), files });
const changes = detectSessionChanges(root, 'test-session');
const all = [...changes.added, ...changes.modified, ...changes.deleted];
const scaffoldTouched = all.some(p => p.includes('ui-system'));
if (scaffoldTouched) {
  process.stderr.write('FAIL: scaffold file reported as changed: ' + all.join(', ') + '\n');
  process.exit(1);
}
process.exit(0);
EOF
assert "T1 unchanged scaffold file not in session changes" "0" "$?"

# ═══════════════════════════════════════════════════════════════════════════
echo "--- T2: file modified during session is detected"
# ═══════════════════════════════════════════════════════════════════════════
REPO="$(make_repo)"
mkdir -p "$REPO/packages/frontend/src"
echo "original" > "$REPO/packages/frontend/src/App.tsx"
node --input-type=module <<EOF
import { computeCurrentState, writeBaseline } from '${BASELINE_MOD}';
const root = '${REPO}';
writeBaseline(root, 'test-session', { created: new Date().toISOString(), files: computeCurrentState(root) });
EOF
# Wait a tick so mtime differs, then modify the file.
sleep 0.05
echo "modified" > "$REPO/packages/frontend/src/App.tsx"
node --input-type=module <<EOF
import { detectSessionChanges } from '${BASELINE_MOD}';
const { modified } = detectSessionChanges('${REPO}', 'test-session');
const found = [...modified].some(p => p.includes('App.tsx'));
process.exit(found ? 0 : 1);
EOF
assert "T2 modified file detected" "0" "$?"

# ═══════════════════════════════════════════════════════════════════════════
echo "--- T3: file added during session is detected"
# ═══════════════════════════════════════════════════════════════════════════
REPO="$(make_repo)"
mkdir -p "$REPO/packages/frontend/src"
node --input-type=module <<EOF
import { computeCurrentState, writeBaseline } from '${BASELINE_MOD}';
writeBaseline('${REPO}', 'test-session', { created: new Date().toISOString(), files: computeCurrentState('${REPO}') });
EOF
echo "new" > "$REPO/packages/frontend/src/NewComponent.tsx"
node --input-type=module <<EOF
import { detectSessionChanges } from '${BASELINE_MOD}';
const { added } = detectSessionChanges('${REPO}', 'test-session');
const found = [...added].some(p => p.includes('NewComponent'));
process.exit(found ? 0 : 1);
EOF
assert "T3 added file detected" "0" "$?"

# ═══════════════════════════════════════════════════════════════════════════
echo "--- T4: file deleted during session is detected"
# ═══════════════════════════════════════════════════════════════════════════
REPO="$(make_repo)"
mkdir -p "$REPO/packages/frontend/src"
echo "to-delete" > "$REPO/packages/frontend/src/Old.tsx"
node --input-type=module <<EOF
import { computeCurrentState, writeBaseline } from '${BASELINE_MOD}';
writeBaseline('${REPO}', 'test-session', { created: new Date().toISOString(), files: computeCurrentState('${REPO}') });
EOF
rm "$REPO/packages/frontend/src/Old.tsx"
node --input-type=module <<EOF
import { detectSessionChanges } from '${BASELINE_MOD}';
const { deleted } = detectSessionChanges('${REPO}', 'test-session');
const found = [...deleted].some(p => p.includes('Old.tsx'));
process.exit(found ? 0 : 1);
EOF
assert "T4 deleted file detected" "0" "$?"

# ═══════════════════════════════════════════════════════════════════════════
echo "--- T5: pre-existing uncommitted file unchanged during session"
# ═══════════════════════════════════════════════════════════════════════════
# (Same as T1 but using untracked file, not committed file.)
REPO="$(make_repo)"
mkdir -p "$REPO/packages/frontend/src"
echo "untracked" > "$REPO/packages/frontend/src/Untracked.tsx"
node --input-type=module <<EOF
import { computeCurrentState, writeBaseline } from '${BASELINE_MOD}';
writeBaseline('${REPO}', 'test-session', { created: new Date().toISOString(), files: computeCurrentState('${REPO}') });
EOF
# Do nothing — file unchanged.
node --input-type=module <<EOF
import { detectSessionChanges } from '${BASELINE_MOD}';
const { added, modified, deleted } = detectSessionChanges('${REPO}', 'test-session');
const all = [...added, ...modified, ...deleted];
process.exit(all.length === 0 ? 0 : 1);
EOF
assert "T5 pre-existing uncommitted file not flagged" "0" "$?"

# ═══════════════════════════════════════════════════════════════════════════
echo "--- T6: Phase 0 complete while Phase 1 scaffold exists — gate passes"
# ═══════════════════════════════════════════════════════════════════════════
REPO="$(make_complete_phase0_repo)"
make_phase1_scaffold "$REPO"

# Baseline was written before session — scaffold files are present then and now.
node --input-type=module <<EOF
import { computeCurrentState, writeBaseline } from '${BASELINE_MOD}';
writeBaseline('${REPO}', 'test-session', { created: new Date().toISOString(), files: computeCurrentState('${REPO}') });
EOF

# Simulate: session adds a Phase 0 audit file.
echo "# New appendix" > "$REPO/docs/redesign/audit/10-new.md"

# The changes set contains only the new audit file.
run_check "$REPO" 0 "Complete with documented blockers" '{"docs/redesign/audit/10-new.md":true}'
assert "T6 Phase 0 complete with Phase 1 scaffold present" "0" "$?"

# ═══════════════════════════════════════════════════════════════════════════
echo "--- T7: genuine missing Phase 0 evidence causes failure"
# ═══════════════════════════════════════════════════════════════════════════
REPO="$(make_repo)"
mkdir -p "$REPO/docs/redesign/audit"
echo "# Audit" > "$REPO/docs/redesign/current-architecture-audit.md"
echo "# Routes" > "$REPO/docs/redesign/audit/01-routes.md"
# No evidence dir.  current-phase.md has no [x].
cat > "$REPO/docs/redesign/current-phase.md" <<'PHASE'
## Phase 0 — Architecture reconnaissance

**Status:** Not started

- [ ] docs/redesign/current-architecture-audit.md
PHASE
printf 'ID,Area,Role,Requirement,Priority,Phase,Status,Code,Tests,Evidence,Notes\n' > \
  "$REPO/docs/redesign/implementation-matrix.csv"
printf 'P0-AUD-001,Foundation,Both,Create route inventory,Critical,0,Planned,,,,\n' >> \
  "$REPO/docs/redesign/implementation-matrix.csv"

set +e
run_check "$REPO" 0 "Not started" '{"docs/redesign/audit/01-routes.md":true}'
ACTUAL=$?
set -e
[ "$ACTUAL" -eq 1 ] || ACTUAL=0
assert "T7 missing evidence fails Phase 0 gate" "1" "$ACTUAL"

# ═══════════════════════════════════════════════════════════════════════════
echo "--- T8: Phase 0 complete — no Phase 0 files changed — gate skips silently"
# ═══════════════════════════════════════════════════════════════════════════
REPO="$(make_complete_phase0_repo)"
# Changed files are only frontend source (not Phase 0 scope).
run_check "$REPO" 0 "Complete with documented blockers" '{"packages/frontend/src/App.tsx":true}'
assert "T8 non-Phase-0 change skips Phase 0 gate" "0" "$?"

# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "Results: ${PASS} passed, ${FAIL} failed"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
