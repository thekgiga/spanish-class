# Hero Video Brief — AI-Generated Loop

**For:** whoever generates the hero background loop (you, in Runway / Kling / Veo / Sora / Pika)
**Goal:** a calm, premium, atmospheric loop that sits *behind* the headline and reads as "your path to Spain" — editorial, not touristy.

---

## 1. The one thing that changes everything: the video is seen through a burgundy wash

The hero does **not** show your raw footage. In [HomePage.tsx](../../packages/frontend/src/pages/public/HomePage.tsx) the media layer is composited like this, bottom to top:

1. Your video, full-bleed, `object-cover`
2. **A 60%-opacity burgundy scrim** (`bg-hero-bg/60`, burgundy `#8B0E1A`) over the *entire* frame
3. A paper texture at 30% opacity
4. The headline block, left-anchored, with a gold vertical rule on its left edge

**Consequences for what you generate:**

- The final look is **burgundy-tinted and darker** than your source clip. Everything gets pulled toward `#8B0E1A`.
- Generate footage that is **warmer and brighter than the target look** — the scrim does the darkening. Warm gold/amber/terracotta footage + burgundy scrim = rich, cohesive brand tone. Cool blue/grey footage + burgundy scrim = muddy brown. **Avoid anything cool.**
- **Luminance contrast survives; subtle color/detail does not.** Favor strong shapes of light and shadow, clear silhouettes, and visible *motion*. Delicate color grading is wasted under the scrim.
- **Faces and text in the footage are a bad idea** — the scrim mutes them into ambiguity and they compete with the headline anyway.

## 2. Composition — where things must go

- Aspect ratio **16:9**. Render **1920×1080** (or 2400×1350 and downscale).
- The headline sits over roughly the **left 55–60%** of the frame, top-aligned, over a gold left-rule.
- **Keep the left ~55% calm and darker** — a wall, deep shadow, or negative space. No busy detail, no bright highlights fighting the text there.
- **Put the subject / the light / the movement in the RIGHT 40%.** This is also the "right-field counterweight at 1440" the visual reviewer asked for.
- Compose for a **slow drift toward the right** or a shaft of light entering from the right, so the eye lands opposite the text.

## 3. Motion — the discipline that makes it read "premium"

One slow, continuous motion. That's it. This is the whole game.

- ONE of: a slow push-in (dolly), a slow drift/pan, or living stillness (a cinemagraph — dust in a light beam, steam, a curtain breathing, leaves shivering) while the frame is otherwise locked.
- **No cuts. No zoom snaps. No fast pans. No people walking across frame.**
- Duration **10–20s**, must **loop seamlessly** (see §7 for the crossfade trick if the tool can't loop natively).
- Think "living photograph," not "travel reel."

## 4. Color & grade direction (tie to tokens)

| Role | Token | Hex | Use in footage |
|---|---|---|---|
| Scrim / final dominant | `hero-bg` (burgundy) | `#8B0E1A` | Applied by the app — don't bake it in |
| Warm light / highlights | `accent` (gold) | `#D4AF7C` | This is your footage's key light — golden hour, warm lamps, sun on stone |
| Bright reliefs | `canvas` (cream) | `#F9F6EF` | Sunlit plaster, paper, tablecloth |
| Deep shadow | `fg` (charcoal) | `#1E1E24` | Shadow side, the calm left lane |

Target grade in-camera: **golden hour, warm white balance (~3200–4000K), high dynamic range with deep shadows and glowing highlights, gentle film grain.** Slightly overexpose the warm highlights — the scrim will tame them.

## 5. How to signal "studying" without breaking the rules

The brand is language education, so the hero should read as *learning*, not just travel. But
faces and readable text are out (§1). Signal studying through **objects, gesture, and place**:

- **Study objects, right 40%:** an open notebook with handwriting, a fountain pen, a worn
  Spanish dictionary / stack of books, reading glasses, flashcards, a cortado beside the books,
  a desk lamp pooling warm light over the page.
- **Study gesture (motion):** a hand slowly writing, a page turning, pages riffling in a breeze.
  Add place with a blurred window onto a Spanish plaza, or books resting on courtyard stone.
- **Language nod, done safely:** handwritten Spanish words are a lovely touch **only if kept as
  warm, out-of-focus bokeh** — texture, never legible. Anything readable becomes a second
  headline competing with your real one, and the scrim mangles it anyway. Shallow depth of field
  is the safeguard.

## 6. Concepts — pick one (my ranking)

**A. Reading on a hilltop at sunset, over a Spanish vista** ← top pick (aspirational + studying + place)
A lone figure seen **from behind** (silhouette, no face) sits on a grassy hilltop at golden-hour
sunset, reading an open book, gazing out over an iconic Spanish skyline glowing warm on the RIGHT.
The low sun and the vista sit right; the LEFT slope and sky stay calmer and darker with negative
space. Motion = grass and hair swaying in the breeze, a page fluttering, light slowly shifting —
loops via crossfade (§8). Reads as "studying, and your path to Spain." Sunset light *is* your gold
accent, so it blends into the brand under the scrim beautifully.

**Pick the Spain-specific vista** (put whichever glowing on the RIGHT):
- **Toledo** ← CHOSEN. The classic postcard panorama is from *across the Tajo (Tagus) river gorge*
  (the Mirador del Valle view): the Gothic **cathedral spire** and the square **Alcázar fortress**
  crowning the hilltop old town, honey-coloured stone catching the sunset. Name those landmarks +
  the river gorge in the prompt so the model renders Toledo specifically, not a generic town.
- Granada / the Alhambra against the Sierra Nevada — study-abroad coded, romantic.
- Seville with the Giralda tower on the skyline.
- Non-landmark fallback — an Andalusian *pueblo blanco* or olive groves rolling to the horizon.

**B. Turning the page** (most active learning signal; needs a crossfade loop — §8)
Warm close-up: a hand slowly turns the page of a Spanish notebook/textbook — marginalia, a
highlighter stroke, a pressed pen — in golden desk-lamp light. Books and the writing hand sit
right-of-centre; the left falls into shadow. Reads as active study. Hand motion won't loop natively,
so crossfade the tail to the head.

**C. Courtyard study nook** (studying + architecture, atmospheric)
A quiet Andalusian courtyard / cloister at golden hour, arches and azulejo tile catching raking
light on the RIGHT. On a stone ledge in the light: a small stack of books and an open notebook.
LEFT falls into shadow with negative space. Motion = drifting dust in the light shaft, a slow
push-in. Bridges "study" and "Spain."

---

## 6. Ready-to-paste prompts

### Concept A — Hilltop reading at sunset (natural-language tools: Runway Gen-3, Kling, Veo, Sora)

> Cinematic wide shot at golden-hour sunset: a lone figure seen from behind, seated on a grassy hilltop reading an open book, gazing out over the historic city of Toledo, Spain, glowing warm on the RIGHT side of the frame — the Gothic cathedral spire and the square Alcázar fortress crowning the honey-coloured old town on its hill, wrapped by the Tajo river gorge. The low sun sits on the right with a soft warm glow and long shadows. The LEFT side is a calmer, darker slope and sky with open negative space. Warm amber, gold and terracotta tones, deep long shadows, gentle film grain, shallow depth of field on the reader. The only motion: tall grass and the figure's hair swaying gently in the breeze, a page fluttering, warm light slowly shifting. Silhouetted back view — no visible face, no readable text, no camera shake. 16:9, aspirational, editorial, premium, contemplative.

**Camera / settings line (append if the tool accepts it):**
> Shot on 85mm, f/2.2, locked tripod, extremely slow, backlit golden hour, warm 3400K white balance, shallow focus on the reader.

**Note on the negative prompt below:** for this concept, *delete* `people` from the negative list
(you want the silhouette) but keep **`facing camera, visible face, readable text`** excluded. Keeping
the figure small and backlit as a silhouette avoids AI face/hand artifacts.

### Concept B — Turning the page

> Warm cinematic close-up of a hand slowly turning the page of an open Spanish notebook on a wooden desk in golden desk-lamp light. Soft illegible handwriting and a highlighter stroke on the page, a fountain pen resting nearby, a worn dictionary at the edge of frame. The writing hand and books sit right-of-centre; the LEFT falls into deep warm shadow. Amber and cream tones, shallow depth of field, subtle film grain, glowing rim light, dust drifting in the lamp glow. One slow continuous page-turn, no cuts, no camera shake. No faces, no readable text. 16:9, intimate, premium, editorial.

### Concept C — Courtyard study nook

> Very slow cinematic push-in on a quiet Andalusian courtyard at golden hour — horseshoe arches and azulejo tilework catching warm raking light on the RIGHT. On a sunlit stone ledge: a small stack of books and an open notebook. The LEFT of the frame stays in deep shadow and empty space. Fine dust motes drift through a shaft of golden light. Rich terracotta, gold and cream tones, volumetric light, shallow depth of field, subtle grain. No people, no readable text, minimal continuous motion. 16:9, calm, premium, editorial.

### Negative prompt (for tools that take one — Kling, Pika, SDXL-based)

> people, faces, crowds, text, captions, watermark, logo, fast motion, camera shake, zoom snap, jump cut, flicker, strobe, cool blue tones, teal, neon, oversaturated, cartoon, 3D render look, lens flare spam, tourists, modern signage, cars

### Pika-style (shorter, keyword-led)

> Andalusian courtyard, golden hour, raking sunlight on tiled arches right side, shadowed empty left side, drifting dust motes, warm terracotta and cream, shallow depth of field, film grain, extremely slow push-in, no people, cinematic, 16:9 -motion 1

---

## 7. Export & encode (must hit the app's file budget)

The hero expects three files at `packages/frontend/public/imgs/brand/`:

| File | What | Budget |
|---|---|---|
| `hero-media.mp4` | H.264 loop, muted | **≤ 4 MB** |
| `hero-media-poster.webp` | first frame (shown while video loads) | **≤ 200 KB** |
| `hero-media.webp` | still fallback (reduced-motion / no-video) | **≤ 400 KB** |

**Hit ≤4 MB with two-pass H.264** (slow footage compresses very well):

```bash
# Two-pass, ~15s clip → ~3.5 MB. Adjust -b:v if longer/shorter.
ffmpeg -i raw.mp4 -c:v libx264 -b:v 2M -pass 1 -an -f mp4 -movflags +faststart /dev/null && \
ffmpeg -i raw.mp4 -c:v libx264 -b:v 2M -pass 2 -an -pix_fmt yuv420p -movflags +faststart hero-media.mp4
```

**Seamless loop** if the tool gave you a clip with a hard start≠end — crossfade the tail into the head:

```bash
# 1s crossfade loop on a ~15s source
ffmpeg -i raw.mp4 -filter_complex \
 "[0]split[a][b];[b]trim=start=14,setpts=PTS-STARTPTS[bt];\
  [a][bt]xfade=transition=fade:duration=1:offset=13" -an loop-src.mp4
# then run the two-pass encode above on loop-src.mp4
```

**Poster + still fallback** (extract frame 0, make WebP):

```bash
ffmpeg -i hero-media.mp4 -vframes 1 frame.png
cwebp -q 82 frame.png -o hero-media-poster.webp   # tune -q down if >200 KB
cwebp -q 86 frame.png -o hero-media.webp           # tune -q down if >400 KB
```

## 8. Wiring (I do this once you drop the files)

Flip two constants in [HomePage.tsx](../../packages/frontend/src/pages/public/HomePage.tsx) (currently `undefined`):

```ts
const heroImageSrc: string | undefined = "/imgs/brand/hero-media.webp";
const heroVideoSrc: string | undefined = "/imgs/brand/hero-media.mp4";
```

Precedence is already handled: **video** (only when not `prefers-reduced-motion`) → **image** → burgundy fallback. Poster path is hard-coded to `/imgs/brand/hero-media-poster.webp`. No layout work needed.

## 9. Acceptance checklist

- [ ] 16:9, 1920×1080+, warm/golden (never cool), subject & motion in the RIGHT 40%, left ~55% calm & dark
- [ ] ONE slow continuous motion, no cuts, no people, no text, 10–20s
- [ ] Loops seamlessly
- [ ] `hero-media.mp4` ≤ 4 MB · `hero-media-poster.webp` ≤ 200 KB · `hero-media.webp` ≤ 400 KB
- [ ] Eyeball it under a mental 60% burgundy wash — does it still read? If it goes muddy, it was too cool or too flat.
