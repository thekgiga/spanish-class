# UI System Integration Notes

These files are source-of-truth references and safe to add before page migration.

Foundation implementation must:

1. Import `src/styles/ui-system.tokens.css` exactly once from the global stylesheet or `main.tsx`.
2. Merge `ui-system.tailwind.extend.cjs` into the current Tailwind `theme.extend` without deleting legacy tokens.
3. Adapt `status.ts` to the exact shared backend enum names and i18n namespace.
4. Add Storybook stories showing both themes and all status states.
5. Keep legacy tokens available only until their final consumer is migrated.

Do not create aliases that preserve old `edu-*` names in newly migrated code. Use semantic names directly.
