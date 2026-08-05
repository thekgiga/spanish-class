# UI/UX Validation Scripts

## Changed-line guardrails

```bash
node scripts/uiux/check-frontend-guardrails.mjs
```

The scanner inspects only added lines/new files so legacy code can be migrated incrementally.

CI can compare against a base SHA:

```bash
node scripts/uiux/check-frontend-guardrails.mjs --base "$BASE_SHA"
```

## Full frontend verification

```bash
node scripts/uiux/frontend-verify.mjs
```

This runs guardrails, frontend typecheck, lint, and build. When frontend source changed, it also requires an implementation-matrix update and a task evidence file.
