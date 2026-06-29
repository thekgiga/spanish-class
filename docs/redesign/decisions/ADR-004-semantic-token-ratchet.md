# ADR-004 — Semantic-token quality ratchet

**Status:** Accepted

New frontend code may not introduce raw colors, arbitrary visual values, or direct legacy palette classes. Enforcement initially checks added lines so the existing application can be migrated incrementally. Whole-repository strictness increases as legacy usage is removed.
