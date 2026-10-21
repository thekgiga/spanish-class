# Frontend Change Evidence — Hero video replacement (HERO-VIDEO-001)

## Scope

- Requirement IDs: HERO-VIDEO-001 (follow-up to HOME-JOURNEY-001 / BRAND-002 hero)
- Roles: Public (all visitors)
- Routes: `/` (HomePage → `HeroSection`)
- BPMN sections: none — marketing surface, no process/state/API impact

## Change

Replaced the homepage hero background video with new footage supplied at
`docs/hero_video_new.mp4` (1920×1080, H.264, ~8s). The hero media is a triple —
background video, pre-load **poster**, and `prefers-reduced-motion` fallback image.
All three were regenerated from the new footage so the first paint, reduced-motion
experience, and playing video stay coherent.

Asset set (overwritten in place — references in `HomePage.tsx:30-32` unchanged, no
orphaned files, no code/logic change):

| File | Before | After |
|------|--------|-------|
| `public/imgs/brand/hero-media-street.mp4` | 3.1 MB (old "street" footage) | **2.35 MB** (new footage, re-encoded) |
| `public/imgs/brand/hero-media-street-poster.webp` | old scene | **67 KB** (frame @1.2s of new footage) |
| `public/imgs/brand/hero-media-street.webp` (reduced-motion) | old scene | **67 KB** (same new frame) |

Encoding: `libx264 -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart -an`
(audio stripped — hero is muted). Source was ~10.7 Mbps; re-encode drops the payload
to 2.35 MB (below the original 3.1 MB) while remaining visually lossless behind the
hero gradient overlay. Poster/fallback webp via `cwebp -q 82` (ffmpeg build lacked
`libwebp`).

## Before

Prior hero footage ("street") — see `HOME-JOURNEY-001` evidence.

## After

- `hero-video-001/hero-1440.png`
- `hero-video-001/hero-1280.png`
- `hero-video-001/hero-768.png`
- `hero-video-001/hero-390.png`
- `hero-video-001/poster-frame-source.png` (extracted poster frame)

## State coverage

- [x] default (video autoplays, muted, loop, playsInline)
- [x] loading (poster shown until video ready — regenerated to match)
- [x] reduced motion (`useReducedMotion` → static fallback `.webp`, regenerated to match)
- [ ] empty / success / error / disabled / stale — N/A (static media, no async flow)

## Responsive evidence

- [x] 390px — `hero-video-001/hero-390.png`
- [x] 768px — `hero-video-001/hero-768.png`
- [x] 1280px — `hero-video-001/hero-1280.png`
- [x] 1440px — `hero-video-001/hero-1440.png`

Hero text, eyebrow, CTAs, and scroll hint remain legible over the new footage at all
four widths; left/bottom gradient scrims preserve contrast.

## Accessibility evidence

- Video is `aria-hidden` decorative background (unchanged); content/CTAs unaffected.
- `prefers-reduced-motion` honored — static image fallback (no code change; existing gate).
- No new interactive elements, no keyboard/focus surface changed.

## Localization evidence

- No strings added or changed. en/sr/es unaffected.

## Automated verification

- `node scripts/uiux/check-ui-system.mjs` → PASS (token contrast 15 pairs; guardrails; integrity).
- `node scripts/uiux/frontend-verify.mjs` → PASS (tsc 0 errors; eslint warnings pre-existing in untouched files; vite build OK).
- Docker: frontend rebuilt `--no-cache`, `frontend_dist` reseeded; assets served (video 2.47 MB / poster 69 KB / HTTP 200); homepage 200; 0 console errors.

## UI/UX reviewer decision

- visual-design-reviewer: see completion report.
- ui-ux-reviewer: see completion report.

## Remaining limitations

- `hero-media-street.*` filename retained (pre-existing naming debt from BRAND-002);
  footage is no longer a "street" scene. Rename deferred to avoid unscoped churn.
- eslint warnings in professor components / stories are pre-existing, not introduced here.
