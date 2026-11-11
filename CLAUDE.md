# cloud-explained

Interactive, visual slide decks that explain cloud architecture concepts to leadership, management and less technical C-suite audiences. Hosted on GitHub Pages straight from `main` (root). **No build step, no framework, no npm, no external CDNs.** Every page is plain HTML, CSS and JS that works when opened from Pages or from a local static server. Fonts are self-hosted, so decks still look right on locked-down corporate networks.

## Audience and tone

- The audience is **executives and managers, not engineers**. Use plain English. Explain any acronym the first time it appears (IaaS, MFA, RTO…).
- **Fun but credible.** Use analogies (pizza, housing, cars), light humour, emoji as icons, and interactive moments (toggles, flip cards, quizzes). Don't patronise.
- One idea per slide. Headlines should be statements or questions a CEO would remember. Body text is short, with no paragraphs over ~25 words.
- Default to **cloud-neutral** wording. Name AWS, Azure or Google Cloud only in callouts or comparisons.
- Use British English (organisation, colour, datacentre).
- Facts and stats need a named source in the slide or speaker notes. Don't invent numbers. Label made-up examples (e.g. "Acme Corp") as illustrative in the notes.
- Every slide gets `<aside class="notes">` speaker notes telling the presenter what to say or ask the room.

## Repo layout

```
index.html                    Home page: lists every deck in the registry; multi-select builds a playlist
assets/engine.css             Design system, theme token defaults, slide engine + theme panel styles
assets/engine.js              Slide engine (navigation, steps, notes, presenter sync, overview, playlist)
assets/themes.js              Theme PRESETS (colour tokens). Add new presets here
assets/theme.js               Theme RUNTIME: applies tokens, derives tints, theme panel, client logo
assets/fonts/                 Self-hosted woff2 fonts (SIL OFL), with LICENSE.txt
decks/registry.js             The list of decks. Only real, merged decks go here
decks/_template/              Copy this to start a new deck
decks/<deck-id>/index.html    The deck's slides
decks/<deck-id>/deck.css      Deck-specific styles (tokens only, see Theming)
decks/<deck-id>/deck.js       Deck-specific interactions
.nojekyll                     Tells Pages to serve files as-is
```

## Home page

- The home page lists **every deck in `decks/registry.js`, and nothing else**. Don't add "coming soon" placeholders to the registry. Future ideas go in the backlog at the bottom of this file.
- Each registry entry needs: `id`, `title`, `subtitle`, `blurb`, `path`, `icon`, `minutes`, `slides`, `tags`.
- A deck is added to the registry in the same PR that adds the deck.

## Adding a new deck

1. Copy `decks/_template/` to `decks/<deck-id>/` (kebab-case id). The template already loads the theme scripts in `<head>`. Keep them.
2. Set `<body data-deck="<deck-id>">` and the `<title>`.
3. Add the entry to `decks/registry.js`.
4. Build slides as `<section class="slide">` inside `<div class="deck">`, following **Theming** below.
5. Run it locally, step through every slide, check the overview (`O`), and run the theme checks in the quality checklist.

## Slide engine contract (assets/engine.js)

- Slides are authored on a fixed **1600×900 stage** that's scaled to fit any screen. Use px sizes as if the screen were 1600×900. Don't use vw/vh inside slides.
- `class="step"` on any element reveals it on the next →. `data-step="n"` overrides the order.
- Slide modifiers: `.center` (centred layout) and `.dark` (statement slide on the `--deep` background).
- Events on each `<section class="slide">`: `slide:enter`, `slide:leave`, `slide:step` (`detail.step` = number of steps shown). Use `slide:step` to drive an interactive visual from the keyboard. For example, the shared-responsibility layer stack uses invisible `.step` spans to walk through On-prem → IaaS → PaaS → SaaS.
- `window.CE` exposes `next()`, `prev()`, `goTo(index, step)`, `index` and `slides`.
- Clicking inside a slide **never** advances it, so buttons and cards are safe to click. Space on a focused button presses the button, not "next".
- Keys: → / Space next, ← back, F fullscreen, N notes, P presenter window (synced via BroadcastChannel), O overview, **T theme**, ? help.
- URL: `#/n` deep-links to a slide. `?playlist=a,b,c` chains decks, and the last slide shows "Up next". `?theme=<preset-id>` or `?theme=~<code>` sets the theme.
- Engine changes affect every deck. Keep them backwards compatible and test all decks.

## Theming (mandatory for every page and every new slide)

Presenters must be able to re-skin any deck in seconds to match a client's brand colours. So **every colour on every slide must come from a theme token.** A deck that hard-codes colours breaks client theming and won't be merged.

### How it works

- `assets/themes.js` holds the presets (Cloud Explained, Midnight, Corporate, Forest, Print / mono).
- `assets/theme.js` runs in `<head>` before first paint. It applies the active theme as CSS variables on `<html>`, derives tints and readable text colours, and remembers the choice in `localStorage`. The theme follows the presenter from the home page into every deck and across playlists, and stays in sync with the presenter window.
- The 🎨 **Theme** button (or `T`) opens the theme panel on the home page and in every deck. From there, a presenter can:
  - pick a preset
  - edit any colour with a colour picker or hex code
  - **upload the client's logo** to pull its colours out, then auto-apply them or click a swatch to assign it
  - show that logo on every slide (bottom-left)
  - save named custom themes in the browser
  - copy a share link that carries the theme
- Logos and custom themes are stored only in the presenter's browser. Nothing is uploaded.
- The engine chrome (controls, notes, help, theme panel) stays deliberately neutral, so it's readable in any theme.

### Tokens: meaning is fixed

| Token | Meaning | Client mapping |
|---|---|---|
| `--customer` | Us / the customer / "you do it" | Client's **primary** brand colour |
| `--provider` | The cloud provider / "someone else does it" | **Secondary** brand colour |
| `--shared` | Shared responsibility / third accent | Third brand colour |
| `--sun` | Highlight, emphasis, call to action | Accent |
| `--ink` | Text, outlines | Dark brand neutral |
| `--paper` | Slide background | |
| `--surface` | Cards, panels, buttons | |
| `--good` / `--bad` | Correct / incorrect | |

Derived tokens are set automatically. Use them, and never recompute them:

- `--paper-2`: subtle fill, e.g. tags
- `--line`: borders and dividers
- `--dot`: background dot texture
- `--ink-soft`, `--ink-faint`: muted text
- `--deep`, `--deep-2`, `--on-deep`, `--on-deep-soft`: `.dark` slides and the cards on them. In dark themes `--deep` is darker than the background, not inverted
- `--on-ink`: text on ink-filled things, e.g. a selected `.btn`
- `--customer-soft`, `--provider-soft`, `--shared-soft`, `--sun-soft`, `--good-soft`: light tints
- `--customer-deep`, `--provider-deep`, `--shared-deep`, `--shared-light`: stripes and pressed states
- `--on-customer`, `--on-provider`, `--on-shared`, `--on-sun`, `--on-good`, `--on-bad`: readable text on a solid fill. This is automatically white or near-black
- `--ink-rgb`: for shadows, as `rgba(var(--ink-rgb), 0.1)`

### Rules for slide authors

1. **No hex, rgb or named colours in deck HTML, CSS or JS.** Use `var(--token)`. The only exceptions are emoji, and true-to-life illustration details where theming would look wrong, like skin tones or a newspaper. Comment each one with `/* theme-exempt: reason */`.
2. **Text on a coloured fill uses the matching `--on-*` token**, never `#fff`. Utility classes `.fill-customer`, `.fill-provider`, `.fill-shared` and `.fill-sun` do this for you.
3. Keep colour meaning consistent: us = `--customer`, provider = `--provider`, shared = `--shared`. Never swap them for decoration.
4. SVG illustrations use `fill="var(--token)"` / `stroke="var(--ink)"`, or `currentColor`, so they re-colour with the theme.
5. Never rely on colour alone to carry meaning. Pair it with a label ("US", "PROVIDER"), an icon or a pattern, because client palettes can make colours look similar.
6. Keep the **bottom-left 200×70px of every slide clear** for the client logo.
7. Don't load fonts or assets from external CDNs. Add woff2 files to `assets/fonts/` with their licence.

## Visual language

- Fonts: Bricolage Grotesque (display) and Inter (body), self-hosted.
- Building blocks: `.card`, `.btn` (`.is-on` for selected), `.pill`, `.tag`, `.kicker`, `.lead`, `.hl` (highlighter underline), `.fill-*`.
- Chunky ink borders (3px) with solid offset shadows give a friendly "whiteboard sticker" feel.
- Illustration style is **still being decided**. Two mockups are under review: (A) hand-drawn whiteboard sketch, and (B) clean illustrated isometric. Both must follow the Theming rules. Update this section once one is chosen.
- Visuals are HTML/CSS/inline SVG and emoji. **No copyrighted images, logos or brand marks** in the repo. Refer to providers by name in text only. Client logos are only ever added at presentation time through the theme panel.
- Respect `prefers-reduced-motion`. Animations should be decorative, never required to understand a slide.

## Git workflow (always follow)

- **Never commit or push directly to `main`.** `main` is what GitHub Pages publishes, so it must only change through a merged pull request.
- For every piece of work, branch from an up-to-date `main`:
  ```bash
  git checkout main && git pull
  git checkout -b <type>/<short-description>   # e.g. deck/ha-vs-dr, fix/quiz-scoring, engine/presenter-timer
  ```
  Branch prefixes: `deck/` (new or reworked deck), `engine/` (shared engine, theming or design system), `fix/`, `docs/`, `chore/`.
- Commit as often as you like on the branch. Those commits get squashed away.
- Push the branch and open a pull request into `main`. Use a clear title and a short description of what changed and why. Include screenshots for visual changes, in at least the default theme and one other theme.
- Merge with **Squash and merge only**, so each PR becomes one clean commit on `main`. Use the PR title as the squash commit message, in the imperative ("Add HA vs DR deck").
- Delete the branch after merging.
- Don't merge until the owner has reviewed it, unless they've explicitly said to go ahead.
- Run the quality checklist below before opening the PR.

## Running locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Opening files directly (file://) mostly works, but the presenter window sync needs a server.

## Quality checklist before opening a PR

- [ ] Every slide fits 1600×900 with nothing clipped or overlapping (check with `O` overview too)
- [ ] Each slide has speaker notes
- [ ] No console errors
- [ ] Interactive elements work with mouse, keyboard and touch
- [ ] Facts have a source. Example companies are labelled illustrative
- [ ] Registry entry and home page card look right
- [ ] **Theme check:** step through the deck in *Cloud Explained*, *Midnight* (dark) and *Print / mono*, plus one custom palette made by uploading a logo. All text stays readable, nothing stays the old colour, and dark slides still stand out
- [ ] **No hard-coded colours:** `grep -nE "#[0-9a-fA-F]{3,8}\b|rgba?\(" decks/<deck-id>/` returns only `theme-exempt` lines
- [ ] Bottom-left logo zone is clear on every slide (turn on a logo in the theme panel)

## Deck backlog (ideas, not in the registry)

Well-Architected pillars · HA vs DR (RTO/RPO) · Landing zones · FinOps · Zero Trust · Cloud migration "6 Rs" · Multi-cloud vs single cloud · Identity as the new perimeter · Data residency and sovereignty.
