# Elite Education — Brand & Landing Implementation Proposal

**Status:** Proposal for review · **Date:** 2026-09-21 · **Branch:** `feat/system-redesign`
**Source content:** [`Elite_Education_sajt_verzija_1_i_2.md`](../instructions/Elite_Education_sajt_verzija_1_i_2.md) (Version 2) · Elite Guide: [`Elite_Guide_finalna_verzija.md`](../instructions/Elite_Guide_finalna_verzija.md), [`Elite_Guide_koncept_dokument-1.md`](../instructions/Elite_Guide_koncept_dokument-1.md), [`FaQ - LeadGuide.md`](../instructions/FaQ%20-%20LeadGuide.md)
**Brand assets:** [`docs/04_BRAND_GUIDE/`](../04_BRAND_GUIDE/)

---

## 1. Decisions locked (from clarification)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Palette strategy | **Re-skin the entire product** — Elite Education burgundy/gold replaces the Editorial Teaching Studio tokens across marketing *and* the logged-in app. |
| 2 | Page structure | **One scrolling landing + existing Contact + Elite Guide content pillar.** V2 sections become anchored sections; Elite Guide is a real hub (index + articles), teased from the landing. *(Expanded after Guide docs were added — see §4b.)* |
| 3 | Language | **Serbian primary** (verbatim from the doc). I draft English + Spanish for review. No hard-coded text. |
| 4 | Hero | **Replace** the paella scroll-story with a new brand hero ("Your path to Spain begins here"). |

---

## 2. Brand system (from the brand guide)

| Token | Value | Role |
|---|---|---|
| Burgundy | `#8B0E1A` | Primary brand / primary buttons / burgundy section blocks |
| Gold | `#D4AF7C` | Accent — thin rules, dividers, small details, secondary button fill |
| Cream / Light beige | `#F9F6EF` | Page canvas |
| Charcoal | `#1E1E24` | Primary text / ink |
| White | `#FFFFFF` | Surfaces, logo-on-dark cards |

**Type:** Playfair Display (headlines) · Montserrat (nav/body) · fallbacks Georgia / Arial.
**Voice:** luxury editorial — generous whitespace, thin gold rules, burgundy blocks, cream backgrounds, subtle paper texture, restrained line-art. No gradients on buttons.
**Buttons:** Primary = burgundy bg / white text. Secondary = gold bg / burgundy text.
**Logo:** master artwork is fixed — never recolour, stretch, crop, or alter the monogram/tilde. On dark sections, place the logo on a white/cream card.

Available assets in `docs/04_BRAND_GUIDE/`: master + cropped + transparent logos, cream/dark/white header logos, burgundy & cream hero backgrounds, paper textures, 4 service-card images, section divider, Spain decorative outline, CTA banner, quote block, 4 OG social images.

---

## 3. ⚠️ Central risk of a full re-skin — status colour collision

The app's UI system encodes **booking lifecycle status in colour** (available / requested / confirmed / blocked / completed / cancelled) and today **confirmed = the brand colour** (ink green). If we make the brand **burgundy (a deep red, ~354°)**, two problems appear:

1. **Confirmed lessons would render red** → visually reads as an error/cancellation.
2. **Burgundy brand vs. the red `danger`/`cancelled` hue (~5°)** become nearly indistinguishable.

**Proposed resolution (needs your sign-off):**
- Decouple **functional status hues from the brand.** Keep **green for available/confirmed** and amber for requested — these are semantic, not brand, and users rely on them. Burgundy is reserved for **brand identity + primary actions**, not for "confirmed".
- `danger`/`cancelled` stay red but get nudged in lightness/saturation so they never read as brand burgundy.
- This keeps the calendar legible while the whole chrome (nav, buttons, headings, focus, links) goes Elite Education.

The alternative — literally recolouring confirmed/available to burgundy — will degrade the core professor/student workflow. I recommend against it and will treat the above as the default unless you say otherwise.

---

## 4. Landing page — section blueprint (Version 2)

Single scrolling page (`HomePage`), top to bottom. All copy via i18n keys.

1. **Hero** — "Ваш пут до Шпаније почиње овде." Burgundy hero background + logo (on cream card), sub-paragraph, two CTAs: `[Истражите наше услуге]` (scroll to Services) + `[Закажите консултацију]` (→ Contact/booking).
2. **О нама / About** — "Ви имате циљ. Ми знамо пут." + mission block.
3. **О оснивачици / Founder** — Невена Мушатовић, Education Consultant. Portrait placeholder + personal narrative + quote-block asset.
4. **Услуге / Services** — 4 cards using service-card images: 01 Spanish language, 02 Studies in Spain, 03 Language camps, 04 Consultations. Each: title, tagline, bullet list, closing line.
5. **Наш приступ / Our approach** — "Више од администрације." 4 pillars: Individual, Expert, Transparent, End-to-end.
6. **Како радимо / How we work** — 4 numbered steps: Talk → Explore → Organize → Support.
7. **Зашто Elite Education / Why us** — 7 value bullets.
8. **Elite Guide teaser** — "Ваш водич кроз Шпанију." Intro line + the **6 rubric cards** (Study / Learn / Live / Experience / Camps / Insights) + 2–3 featured article cards, all linking into the guide (§4b). This is the landing's on-ramp into the content pillar — it "blends" the guide into the main scroll rather than hiding it.
9. **Честа питања / FAQ** — a compact accordion of the highest-intent questions ("Шта је UNEDasiss?", "DELE или SIELE?", "Колико коштају студије?"), each answer a 2–3 sentence summary that links to the full guide article. Reuses the guide content; no duplicate copy.
10. **Завршна секција / Final CTA** — "Спремни за следећи корак?" burgundy block + `[Закажите консултацију]`.
11. **Footer** — logo, tagline "Education. Language. Spain.", nav (incl. Elite Guide), contact.

Header/footer (public layout) get the Elite Education logo and nav anchors; the current public `Header` already watches a `#landing-hero-end` sentinel — preserved.

---

## 4b. Elite Guide — content pillar

The three guide docs turn Elite Guide from a teaser stub into a **real, publishable content pillar**. `FaQ - LeadGuide.md` already contains the full text of **12 finished articles** (Serbian, with sourced 2026 figures — €/ECTS, city living costs, DELE/SIELE validity, UNEDasiss/PCE deadlines). `Elite_Guide_finalna_verzija.md` is the newer/expanded structure (supersedes the concept doc) and defines the taxonomy.

**How it fits the "one landing + Contact" structure:** the guide is *surfaced from* the landing (teaser §4-8 + FAQ §4-9) but *lives* in its own lightweight hub so the 12 articles have real URLs (SEO, shareable, the discreet per-article CTAs the docs specify). This is the smallest structure that lets the content "blend into the whole site" without cramming 12 long reads into the scroll.

**Taxonomy — 6 rubrics** (from the final doc): Студирај (Study) · Учи (Learn) · Живи (Live) · Доживи (Experience) · Кампови (Camps) · Elite Insights. Every article belongs to one rubric.

**Routes** (both under `PublicLayout`, both lazy):
- `/elite-guide` — hub: brand hero ("Ваш водич кроз Шпанију"), 6 rubric cards, article grid filterable by rubric.
- `/elite-guide/:slug` — article: editorial reading layout, breadcrumb, rubric tag, body, discreet closing CTA into the relevant service/consultation.

**Content model (recommended).** Long-form article bodies do **not** belong in i18n JSON (they are prose, not UI strings, and would bloat the namespaces). Proposed split:
- **Metadata** (slug, rubric, title, excerpt, hero asset, CTA target, order) → a typed index module, translatable per locale.
- **Body** → localized Markdown/MDX under `packages/frontend/src/content/elite-guide/{lang}/{slug}.md`, rendered by one Markdown component. UI chrome (nav, rubric labels, "read more", CTA button) stays in an `elite-guide` i18n namespace.

**Seed content:** the 12 articles map straight onto the rubrics —

| # | Article (from FaQ - LeadGuide) | Rubric |
|---|---|---|
| 01 | Како уписати факултет у Шпанији | Study |
| 02 | Шта је UNEDasiss и коме је потребан | Study |
| 03 | Шта је PCE и како се припремити | Study |
| 04 | Колико коштају студије и живот студента | Live |
| 05 | DELE или SIELE — који испит изабрати | Learn |
| 06 | Како да одредите свој ниво шпанског | Learn |
| 07 | Мадрид, Барселона, Валенсија или Малага | Live |
| 08 | Како пронаћи смештај у Шпанији | Live |
| 09 | Шта треба да знате пре првог језичког кампа | Camps |
| 10 | Пет ствари које ћете приметити у Шпанији | Experience |
| 11 | Мој први боравак у Мадриду | Insights |
| 12 | Зашто сам покренула Elite Education | Insights |

**Translation reality (flag).** These 12 bodies are long and contain **factual figures, dates, and institution names**. Serbian ships verbatim. English + Spanish I can draft, but factual translation carries accuracy risk (currency, deadlines, source attributions) and is a large task — so I recommend: ship the **hub + chrome + FAQ trilingual immediately**, and stage article-body en/es as a reviewed follow-up rather than blocking the guide launch on 24 long translated reads. Non-Serbian visitors see the hub/FAQ in their language and articles fall back to Serbian until their locale is reviewed. Confirm whether that staged approach is acceptable or all three must land together.

---

## 4c. Content coverage & enrichment

A visible ledger so no source content is dropped silently. Status: **Captured** (in the plan/seed), **Seed later** (structure defined, no article text yet), **Needs source** (would require data/assets we don't have — and must not be fabricated).

| Content area | Source doc | Status | Note |
|---|---|---|---|
| Landing sections (hero, about, founder, services, approach, steps, why-us, CTA) | sajt V2 | Captured | §4 blueprint |
| 12 guide articles | FaQ - LeadGuide | Captured | §4b table, seeded verbatim (sr) |
| 6 rubrics taxonomy | Guide finalna | Captured | §4b |
| Landing FAQ accordion | derived | Captured | §4-9, summaries of high-intent articles |
| **Study-by-City** (Madrid/Barcelona/Valencia/Málaga hubs) | Guide finalna | Seed later | Articles 04/07/08 already carry the city data; a per-city landing is a future rubric view, not in the 12 seeds |
| **Study-by-Field** | Guide finalna | Seed later | Structure only; no article text exists yet |
| **University Guides** | Guide finalna | Needs source | Requires real institution data per university — do not fabricate; needs founder input |
| **Elite Picks / Student Choice** | Guide finalna | Needs source | Editorial curation/endorsement — needs the founder's real picks, not invented |

**Enrichment I can add around the real content (no fabricated data):**
- **Cross-linking** between articles (costs ↔ choosing a city; DELE/SIELE ↔ assess your level) so the 12 pieces form a guided path.
- **A "Start here" entry** for the "I want to go to Spain but don't know where to begin" visitor (the founder's own framing, article 12).
- **Per-rubric intro blurbs** + a short **glossary** (UNEDasiss, PCE, ECTS, DELE, SIELE) for newcomers.
- **SEO + Open Graph metadata** per article/hub, using the 4 existing OG assets in the brand folder.

**Boundary:** enrichment is structural/editorial only. No invented figures, universities, testimonials, or "top 10" lists — the brand guide and page blueprint both forbid fabricated stats, and the "Needs source" rows above stay blocked until real content is supplied.

---

## 5. Work plan (phased)

### Phase A — Brand token foundation (blocks everything)
- Rewrite `docs/ui-system/design-tokens.json` + `packages/frontend/src/styles/ui-system.tokens.css`: brand → burgundy family, accent → gold, canvas → cream, ink → charcoal; re-derive hover/active/soft steps and **re-check WCAG AA** (gold on cream fails for text — gold is a rule/detail colour, not body/CTA text).
- Re-derive booking-status tokens per §3; keep central status mapping intact.
- Swap font tokens to Playfair Display + Montserrat; add/verify the font-loading pipeline (Montserrat is new).
- Update the UI-system docs (`02-color-system.md`, `03-typography.md`, north star) so the source of truth matches reality.
- **Full-app visual re-verification** at 390 / 768 / 1280 / 1440 — every logged-in screen changes colour here.

### Phase B — Assets & i18n scaffold
- Copy brand assets into `packages/frontend/public/imgs/brand/` (or similar); optimize; wire logo variants.
- Build the `home.json` namespace (repurpose current one — remove paella keys) for **en/sr/es**: sr verbatim, en/es drafted for your review.

### Phase C — Landing rebuild
- Replace `HomePage.tsx` sections per §4, brand-skinned, reusing canonical components (`Button`, cards) before adding new ones. New section components get stories before composition (UI-system rule).
- Retire the paella scroll-story + its assets/keys.
- Update public `Header`/`Footer` + logo (nav gains an Elite Guide anchor/link).

### Phase E — Elite Guide content pillar (see §4b)
- Add `/elite-guide` index route + `/elite-guide/:slug` article route under `PublicLayout` (updating the route architecture doc — a new top-level route is not allowed silently).
- Build the article content system (§4b): typed article index (metadata + category + hero + CTA) plus localized long-form bodies.
- Seed the **12 ready articles** from `FaQ - LeadGuide.md` (sr verbatim; en/es drafted for review). Wire the landing FAQ accordion to summaries of the highest-intent ones.
- Article/index components get stories; verify reading layout at all four breakpoints.

*(Phase E can ship after Phase C — the landing teaser degrades gracefully to "coming soon" if the guide isn't live yet, but the intent is to ship them together so the guide "blends into the whole site" as requested.)*

### Phase D — Verification & sign-off
- Reduced-motion, keyboard, screen-reader paths.
- Independent reviewers: `ui-ux-reviewer` + `visual-design-reviewer`.
- Update the UI implementation matrix / component inventory.
- Screenshots at all four breakpoints as evidence.

---

## 6. Open questions before implementation

1. **Status-colour resolution (§3)** — confirm we keep green for confirmed/available and reserve burgundy for brand/primary. *(My strong recommendation.)*
2. **Founder photo** — is there a portrait of Невена Мушатовић to include, or a placeholder for now?
3. **"Book a consultation" target** — does it point to the existing Contact page, the auth/booking flow, or a new consultation form?
4. **Dark mode** — the app has a complete opt-in dark theme in tokens. Re-skin dark too now, or defer (it's currently not exposed)?
5. **Elite Guide content model** — OK with Markdown/MDX bodies + typed metadata index (§4b), or do you want articles authored some other way (e.g. a future CMS)? This choice is hard to reverse cheaply once 12 articles are seeded.
6. **Guide translation staging** — ship hub/FAQ trilingual now with article bodies Serbian-first (en/es as reviewed follow-up), or must all three languages land together before the guide goes live? *(§4b — recommend staged.)*
7. **Guide vs. FAQ framing** — you named both "lead guide section OR frequently asked questions." Proposal does **both**: a landing FAQ accordion (high-intent Q&A summaries) that links into the full guide hub. Confirm that's the blend you want, versus FAQ-only or guide-only.
8. **Legacy palettes** — `tailwind.config` still carries `luxury.gold`, `spanish-red`, `charcoal` from earlier migration phases. OK to remove any that the re-skin orphans?

---

## 7. What I am NOT doing without further instruction

- Not touching backend, auth, or booking business logic.
- Not publishing/deploying — this branch only.
- Not inventing testimonials/statistics (brand guide + blueprint both forbid fabricated stats; the V2 doc has no testimonials, so that section is dropped unless you provide real ones).
