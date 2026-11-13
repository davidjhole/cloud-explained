# Cloud Explained brand style guide

This is the source of truth for how a Cloud Explained deck looks, sounds and behaves. `CLAUDE.md` covers the repo, the engine and the workflow. When the two disagree on a visual or tone question, this file wins, and `CLAUDE.md` should be updated to match.

The house style is **"whiteboard sketch"** (mockup A, chosen November 2026): a cloud architect sketching on a whiteboard for the board. Hand-drawn edges, scribbled notes and simple doodle characters, held together by clean, bold headlines and plain-English body text so it always reads as professional.

Contents:

1. [Voice and tone](#1-voice-and-tone)
2. [The sketch style](#2-the-sketch-style)
3. [Characters and doodles](#3-characters-and-doodles)
4. [Colour](#4-colour)
5. [Typography](#5-typography)
6. [Iconography and illustration](#6-iconography-and-illustration)
7. [Layout](#7-layout)
8. [Motion and interaction](#8-motion-and-interaction)
9. [Do and don't](#9-do-and-dont)
10. [Pre-merge brand check](#10-pre-merge-brand-check)

---

## 1. Voice and tone

**Who we're talking to:** executives, managers and C-suite people who make decisions about the cloud but don't build it. They are smart and busy. They are not engineers.

**How we sound:** a trusted colleague at a whiteboard. Fun but credible. Warm, a little playful, never smug.

| We are | We are not |
|---|---|
| Plain English | Jargon, or acronyms left unexplained |
| Concrete (pizza, houses, hotels) | Abstract ("leverage synergies") |
| Lightly funny | Jokey, sarcastic or patronising |
| Confident and sourced | Hype, scare stats, or invented numbers |
| Cloud-neutral | A sales pitch for one provider |

### Writing rules

- **One idea per slide.** If you need "and" in the headline, it's probably two slides.
- **Headlines are statements or questions a CEO would repeat.** "The provider secures the cloud. You secure what you put in it." beats "Shared responsibility overview".
- **Body text is short.** No paragraph over about 25 words. Prefer three short bullets to one long one.
- **Explain every acronym the first time it appears** on a slide or in the deck: "IaaS (Infrastructure as a Service)".
- **British English:** organisation, colour, datacentre, optimise, programme (but "computer program").
- **Sentence case** for headlines, buttons and labels. Only the kicker is upper case (and only the plain, non-scribble kicker).
- **Cloud-neutral by default.** Say "the cloud provider". Name AWS, Azure or Google Cloud only in a callout or comparison, and never use their logos.
- **Numbers need a named source**, in the slide or the speaker notes. Made-up example companies (e.g. "Acme Corp") are labelled illustrative in the notes.
- **Speaker notes on every slide** (`<aside class="notes">`), written as what the presenter says or asks the room, not as a script to read aloud word for word.

### Scribbled voice

The hand-written lines (`.scribble`) are the presenter "talking" on the board. They have their own, more casual voice:

- lower case, short, conversational: "the question everyone thinks they know the answer to…"
- asides and punchlines, not information the slide depends on
- speech from characters uses quote marks: "I look after this bit"
- one or two per slide at most, so they stay special

---

## 2. The sketch style

Everything on a slide should look drawn, except the words. Text is always crisp and clean. Only edges, outlines and illustrations wobble.

### How the wobble works

`assets/sketch.js` injects two SVG filters into every page:

| Filter | Use | Strength |
|---|---|---|
| `#ce-rough` | Boxes, cards, buttons, pills, notes, the highlighter, the cloud doodle | Stronger wobble (displacement scale 5) |
| `#ce-rough-soft` | Characters, small icons, thin lines and arrows | Gentle wobble (scale 3) |

It also provides `#ce-hatch`, a diagonal hatching pattern used for shading (for example on the server rack). Use it as `fill="url(#ce-hatch)"` on top of a solid fill.

### Building blocks

Use these instead of drawing your own borders or shadows.

| Class | What it is | Notes |
|---|---|---|
| `.sk` | Any element as a hand-drawn box | The fill and outline sit on a `::before` layer through `#ce-rough` |
| `.card` | Content card | `.sk` with padding and a soft offset shadow |
| `.btn` | Button | Chunky ink shadow that presses down on click. `.is-on` fills it with ink |
| `.pill` | Rounded label | Use `.dot` inside for a colour key |
| `.note` | Sticky note | Tilted `-1.5deg`, folded corner, `--sun-soft` fill. Heading uses `.note-title` |
| `.tag` | Small upper-case tag | Flat `--paper-2` fill, deliberately *not* sketched so it stays quiet |
| `.hl` | Highlighter-pen underline | Single line only |
| `.sk-line` | Hand-drawn SVG stroke | Arrows, braces, roofs, "the line". Add `.dashed` for a dashed stroke |
| `.fill-customer` / `-provider` / `-shared` / `-sun` | Coloured sketch fill with readable text | `-shared` is striped so it reads without colour |

Tune a sketch box with custom properties, **never** `background` or `border`:

```css
.my-box {
  --sk-fill: var(--provider-soft);   /* any background value, including gradients */
  --sk-stroke: var(--ink);           /* outline colour */
  --sk-width: 3px;                   /* outline width, 3px is the house weight */
  --sk-radius: 12px 18px 14px 16px;  /* keep corners uneven so it looks drawn */
  --sk-shadow: 5px 6px 0 rgba(var(--ink-rgb), 0.12);
}
```

### Line weights

| Thing | Weight |
|---|---|
| Box outlines (`.sk`) | 3px |
| Doodle outlines, `.sk-line` arrows | 4px |
| Emphasis strokes (hat brims, spanner) | 5px |
| Fine detail (eyes' smile, key hole) | 3px |

Keep to these. Mixing in 1px or 8px strokes breaks the "one marker pen" feel.

### Backgrounds

- **Normal slides** are whiteboard grid paper: `--paper` with `--grid` lines every 40px. Don't cover the grid with a full-bleed fill.
- **`.dark` slides** are the chalkboard: `--deep` background, `--on-deep` text. Use them for statement moments (a big question, a key takeaway, a section break), roughly one in every five or six slides, so they keep their punch.

---

## 3. Characters and doodles

Doodles live in `assets/sketch.js` and are drawn with `<use>`. Always copy the `viewBox` from the symbol so the figure is framed correctly:

```html
<svg class="doodle" viewBox="-50 -22 140 150"><use href="#ce-doodle-provider"/></svg>
```

| Doodle | id | viewBox | Means | Colours |
|---|---|---|---|---|
| Person in a hard hat with a spanner | `ce-doodle-provider` | `-50 -22 140 150` | **The cloud provider** | Body `--provider`, hat `--sun` |
| Person waving | `ce-doodle-us` | `-90 -8 145 165` | **Us / the client** | Body `--customer` |
| Key | `ce-doodle-key` | `-28 -28 120 56` | Access, identity, passwords | `--sun` |
| Cloud | `ce-doodle-cloud` | `0 30 640 360` | The cloud, a provider's estate | `--provider-soft` |
| Server rack | `ce-doodle-rack` | `-6 -6 82 132` | Hardware, a datacentre | `--surface` + hatch, `--good` status light |
| Curved arrow | `ce-doodle-arrow` | `0 0 120 60` | Flow, "this leads to" | `currentColor`, so set `color` on the `<svg>` |

### Character rules

- **Meaning is fixed.** The hard hat is always the provider. The waving person is always us or the client. Never swap them, recolour them to the other side's token, or use them as generic decoration.
- **Skin and hair are not themed.** `--skin` and `--hair` are natural tones, marked theme-exempt, so characters never turn blue or orange with a client palette.
- **Faces stay simple:** two dot eyes and a smile. No extra expressions inside a deck. If a deck needs a worried or surprised version, add it to `assets/sketch.js` for everyone.
- **Speech goes in a scribble**, placed near the character, in the character's colour (`.scribble.c-provider` for the provider, plain `.scribble` for us).
- **Size:** characters work best between roughly 120px and 260px tall on the 1600×900 stage. Smaller and the faces disappear; larger and they compete with the headline.
- **Flip with CSS** (`transform: scaleX(-1)`) to make a character face the other way. Don't redraw it.
- **No new characters or doodles inside a deck.** Add them to `assets/sketch.js`, colour them only with tokens, run them through `#ce-rough-soft`, and add a row to the table above and to `CLAUDE.md`.

---

## 4. Colour

Every colour on every slide comes from a theme token, so a presenter can re-skin a deck to a client's brand in seconds. The token list and the technical rules live in `CLAUDE.md` under **Theming**. This section is about *how to use colour well*.

### Meaning first

| Token | Means | Use it for |
|---|---|---|
| `--customer` | Us, the client, "you do it" | The client's side of any comparison, the waving person, kickers |
| `--provider` | The cloud provider, "someone else does it" | The provider's side, the hard hat, the cloud |
| `--shared` | Shared responsibility | Things both sides own. Always striped (`.fill-shared`) |
| `--sun` | Highlight, emphasis, call to action | Highlighter, sticky notes, the key, the progress bar |
| `--good` / `--bad` | Right / wrong | Quiz answers, ticks and crosses |
| `--ink` | Text and outlines | Everything drawn in "marker pen" |

If a colour doesn't mean something, don't use a meaning colour for it. Use `--ink`, `--surface`, `--paper-2` or a `-soft` tint instead.

### Proportions

Aim for a slide that is mostly paper and ink, with colour where it carries meaning:

- **~70%** paper and grid
- **~20%** ink (text, outlines) and surface (cards)
- **~10%** meaning colours (customer, provider, shared) and sun

Soft tints (`--customer-soft`, `--provider-soft` and friends) are for large areas. Solid fills are for small, important things.

### Never colour alone

Client palettes can make two colours look alike, and the Print / mono preset removes colour entirely. Always pair colour with one of:

- a label ("US", "PROVIDER", "SHARED")
- a character (hard hat or waving person)
- a pattern (stripes for shared, `#ce-hatch` for shading)
- an icon or emoji

### Across themes

Every slide must look right in each preset:

| Preset | What to watch for |
|---|---|
| **Cloud Explained** (default) | The reference look. Warm paper, coral us, blue provider |
| **Midnight** (dark) | `--deep` is *darker* than the paper, not inverted. The highlighter becomes a full marker block with `--on-sun` text. Check `.dark` slides still stand out |
| **Corporate** | Teal and navy are close in tone. Labels matter |
| **Forest** | Orange us, green provider. Check `--good` isn't confused with `--provider` |
| **Print / mono** | Greys only. Anything that relied on colour will vanish. This is the strictest test |
| **A logo-derived custom palette** | Upload a real-looking logo in the theme panel. The panel warns when text contrast is low or when primary and secondary look too similar |

### Text on colour

Text on a solid fill always uses the matching `--on-*` token (or a `.fill-*` class, which sets it for you). `theme.js` picks white or near-black for each fill automatically, so never set `#fff` by hand.

---

## 5. Typography

Four self-hosted typefaces (SIL OFL, in `assets/fonts/`), each with one job:

| Role | Typeface | Token / class | Job |
|---|---|---|---|
| Headlines | Bricolage Grotesque | `--font-display`, `h1`–`h3` | Bold, clean, never hand-written |
| Body | Inter | `--font-body` | Everything people need to read |
| Scribbles | Caveat | `--font-hand`, `.scribble` | The presenter's hand-written asides |
| Labels | Kalam | `--font-label`, `.hand` | Labels inside diagrams, layer names, tabs, `.note-title` |

### Scale (on the 1600×900 stage)

| Element | Size | Weight | Notes |
|---|---|---|---|
| `h1` | 112px | 800 | Title and statement slides only. Line height 1.02, tracking -0.02em |
| `h2` | 68px | 800 | The usual slide headline |
| `h3` | 34px | 700 | Card and section titles |
| `.lead` | 36px | 400 | Standfirst under a headline. Max width 1150px, `--ink-soft` |
| `p`, `li` | 28px | 400 | Body. Line height 1.4 |
| `.small` | 20px | 400 | Captions, sources. Don't go smaller on a slide |
| `.kicker` | 20px | 700 | Upper case, tracking 0.14em, `--customer` |
| `.kicker.scribble` | 40px | 700 | The hand-written kicker, lower case. Preferred in the house style |
| `.note-title` | 30px | 700 | Kalam |
| `.pill` | 20px | 700 | |
| `.tag` | 16px | 700 | Upper case, tracking 0.06em |
| `.btn` | 24px | 700 | |

### Rules

- **Never set a headline in Caveat or Kalam.** The clean headline is what keeps the sketch style credible.
- **20px is the floor** for anything the audience should read. Back-of-the-room legibility matters more than fitting everything in.
- Scribbles are rotated about `-2deg` and don't wrap (`white-space: nowrap`). Keep them to one short line, or break deliberately with `<br>`.
- Use **bold** for the one phrase per paragraph you'd want someone to remember. Don't use italics for emphasis.
- `.hl` (highlighter) once per slide at most, on a single line.

---

## 6. Iconography and illustration

In order of preference:

1. **A doodle from `assets/sketch.js`** when the thing has a fixed meaning (provider, us, key, cloud, rack, arrow).
2. **Emoji** for quick, decorative icons: 🍕 🏠 🛵 🏨 🔐. They are fine and theme-exempt. Use them at a consistent size within a slide (for example all at 56px in a row of cards) and don't rely on them alone to carry meaning, because they render differently on Windows, Mac and phones.
3. **New inline SVG** for anything else, built from tokens (`fill="var(--token)"`, `stroke="var(--ink)"` or `currentColor`), using `.sk-line` for strokes and `#ce-rough` / `#ce-rough-soft` for edges so it matches. If it's reusable, it belongs in `assets/sketch.js`.

Never:

- photos, stock illustrations or clip art
- provider logos, product icons or any brand marks (name providers in text only)
- the client's logo inside the repo (it's added at presentation time through the theme panel)
- external image or icon CDNs

---

## 7. Layout

### The stage

- Slides are authored on a fixed **1600×900** stage and scaled to fit. Use px as if the screen were 1600×900. No `vw`/`vh` inside slides.
- Default slide padding is **80px top, 110px sides, 90px bottom**. Keep content inside it.
- The background grid is **40px**. Snapping big elements to multiples of 40 (or 20) makes slides feel tidy without looking rigid.

### Reserved zones

- **Bottom-left 200×70px is the client logo zone.** Nothing goes there, on any slide, including `.dark` ones.
- **Bottom-right** is where the engine controls float in the browser. Keep important content clear of the last ~200×70px there too.

### Common layouts

| Layout | When | How |
|---|---|---|
| **Statement** | Title, big question, takeaway | `.slide.center`, often `.dark`. One `h1` or `h2`, optional scribble |
| **Headline + visual** | Most slides | Kicker, `h2`, then one diagram or interactive filling the rest |
| **Row of cards** | Comparisons (pizza, housing, IaaS→SaaS) | 2 to 4 `.card`s in a row, equal widths, ~24–32px gap. Same structure in every card |
| **Split** | Us vs provider | Left/right halves, us on the **left**, provider on the **right**, consistently across a deck |
| **Sticky note callout** | A tip, a warning, "remember this" | One `.note`, tilted, in a corner of a content slide. Not more than one per slide |

### Breathing room

- If a slide feels full, it is. Split it.
- Leave at least 40px between unrelated groups and 20px within a group.
- Keep scribbles and characters off the headline. They should point *at* things, not sit *on* them.

---

## 8. Motion and interaction

- **Reveal one thing at a time** with `.step`. Each press of → should add one idea.
- **Motion is decorative, never required.** Everything must make sense with `prefers-reduced-motion` turned on, where the engine removes transitions.
- **Interactive moments** (toggles, flip cards, quizzes, sliders) are encouraged, about one per three or four slides. Each one must work with mouse, keyboard and touch, and should be drivable from the keyboard via `slide:step` so a presenter never has to grab the mouse.
- Buttons press down (they move 3px and lose their shadow). Selected buttons fill with ink (`.is-on`). Keep this behaviour consistent; don't invent new button states inside a deck.
- Keyboard focus is shown with a 4px `--sun` outline. Don't remove it.

---

## 9. Do and don't

| Do | Don't |
|---|---|
| Use `.sk`, `.card`, `.note` for every box | Use `border:` or `box-shadow:` on slide boxes |
| Colour with `var(--token)` | Write a hex, `rgb()` or named colour in deck code (unless commented `theme-exempt`) |
| Put us on the left in `--customer`, provider on the right in `--provider` | Swap sides or colours for variety |
| Label coloured things ("US", "PROVIDER") | Rely on colour alone |
| Keep headlines in Bricolage Grotesque | Hand-write a headline in Caveat |
| Write "the question everyone thinks they know…" as a scribble | Put essential information only in a scribble |
| Use the hard hat for the provider every time | Use the hard hat as a generic "engineer" or "IT team" |
| Explain IaaS the first time it appears | Assume the board knows the acronym |
| Cite a named source in the notes | Use a stat you can't trace |
| Add a new doodle to `assets/sketch.js` | Draw a one-off character inside a deck |
| Leave the bottom-left logo zone empty | Tuck a caption or doodle into it |
| Make one idea per slide | Cram a comparison table and a diagram onto one slide |
| Name a provider in a comparison callout | Use any provider logo |

---

## 10. Pre-merge brand check

Alongside the quality checklist in `CLAUDE.md`, a reviewer should be able to say yes to each of these:

- [ ] Every headline is a statement or question in plain, British English, in sentence case
- [ ] No body paragraph is over ~25 words, and every acronym is explained on first use
- [ ] Every box is sketched (`.sk` family). No plain borders or shadows on slides
- [ ] Characters keep their meaning: hard hat = provider, waving person = us
- [ ] Every meaning colour is paired with a label, character, pattern or icon
- [ ] The deck reads well in Cloud Explained, Midnight and Print / mono, and with a logo-derived palette
- [ ] Nothing sits in the bottom-left 200×70px logo zone
- [ ] Nothing on a slide is smaller than 20px
- [ ] Scribbles are short asides, at most one or two per slide
- [ ] The deck still makes sense with reduced motion on
