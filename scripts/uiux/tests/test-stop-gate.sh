#!/usr/bin/env bash
# scripts/uiux/tests/test-stop-gate.sh
#
# Canonical location for the stop-gate test suite.
# Delegates to the implementation in .claude/hooks/tests/test-stop-gate.sh
# so the test logic lives alongside the hook source it exercises.
#
# Run from the repository root:
#   bash scripts/uiux/tests/test-stop-gate.sh

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOOKS_TEST="$SCRIPT_DIR/../../../.claude/hooks/tests/test-stop-gate.sh"

if [ ! -f "$HOOKS_TEST" ]; then
  echo "ERROR: delegate test not found at $HOOKS_TEST" >&2
  exit 1
fi

exec bash "$HOOKS_TEST" "$@"
