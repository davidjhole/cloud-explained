# cloud-explained

Interactive, visual slide decks that explain cloud architecture concepts to leadership, management and less technical C-suite audiences. Hosted on GitHub Pages straight from `main` (root). **No build step, no framework, no npm.** Every page is plain HTML, CSS and JS that works when opened from Pages or from a local static server.

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
index.html                    Home page: deck picker. Multi-select builds a playlist.
assets/engine.css             Shared design system + slide engine styles (palette, type, cards, buttons)
assets/engine.js              Shared slide engine (navigation, steps, notes, presenter sync, playlist)
decks/registry.js             Single list of all decks (drives home page + playlists)
decks/_template/              Copy this to start a new deck
decks/<deck-id>/index.html    The deck's slides
decks/<deck-id>/deck.css      Deck-specific styles
decks/<deck-id>/deck.js       Deck-specific interactions
.nojekyll                     Tells Pages to serve files as-is
```

## Adding a new deck

1. Copy `decks/_template/` to `decks/<deck-id>/` (kebab-case id).
2. Set `<body data-deck="<deck-id>">` and the `<title>`.
3. Add an entry to `decks/registry.js` with `status: "ready"`. If a "coming-soon" placeholder already exists, flip its status instead of adding a duplicate.
4. Build slides as `<section class="slide">` inside `<div class="deck">`.
5. Run it locally (see below), step through every slide, and check the overview (`O`).

## Slide engine contract (assets/engine.js)

- Slides are authored on a fixed **1600×900 stage** that's scaled to fit any screen. Use px sizes as if the screen were 1600×900. Don't use vw/vh inside slides.
- `class="step"` on any element reveals it on the next →. `data-step="n"` overrides the order.
- Slide modifiers: `.center` (centred layout) and `.dark` (navy background).
- Events on each `<section class="slide">`: `slide:enter`, `slide:leave`, `slide:step` (`detail.step` = number of steps shown). Use `slide:step` to drive an interactive visual from the keyboard. For example, the shared-responsibility layer stack uses invisible `.step` spans to walk through On-prem → IaaS → PaaS → SaaS.
- `window.CE` exposes `next()`, `prev()`, `goTo(index, step)`, `index` and `slides`.
- Clicking inside a slide **never** advances it, so buttons and cards are safe to click. Space on a focused button presses the button, not "next".
- Keys: → / Space next, ← back, F fullscreen, N notes, P presenter window (synced via BroadcastChannel), O overview, ? help.
- URL: `#/n` deep-links to a slide. `?playlist=a,b,c` chains decks, and the last slide shows "Up next".
- Engine changes affect every deck. Keep them backwards compatible and test all ready decks.

## Visual language (keep consistent across decks)

Colours are CSS variables in `assets/engine.css`. **Their meaning is fixed:**

| Variable | Meaning |
|---|---|
| `--customer` (coral) | Us / the customer / "you do it" |
| `--provider` (blue) | The cloud provider / "someone else does it" |
| `--shared` (purple, striped) | Shared responsibility |
| `--sun` (yellow) | Highlight / emphasis / call to action |
| `--good` / `--bad` | Correct / incorrect (quizzes, myths) |

- Fonts: Bricolage Grotesque (display) and Inter (body), loaded from Google Fonts with system fallbacks.
- Building blocks: `.card`, `.btn` (`.is-on` for selected), `.pill`, `.tag`, `.kicker`, `.lead`, `.hl` (highlighter underline).
- Chunky ink borders (3px) with solid offset shadows give a friendly "whiteboard sticker" feel. Keep it.
- Visuals are HTML/CSS/inline SVG and emoji. **No copyrighted images, logos or brand marks.** Refer to providers by name in text only.
- Respect `prefers-reduced-motion`. Animations should be decorative, never required to understand a slide.

## Git workflow (always follow)

- **Never commit or push directly to `main`.** `main` is what GitHub Pages publishes, so it must only change through a merged pull request.
- For every piece of work, branch from an up-to-date `main`:
  ```bash
  git checkout main && git pull
  git checkout -b <type>/<short-description>   # e.g. deck/ha-vs-dr, fix/quiz-scoring, engine/presenter-timer
  ```
  Branch prefixes: `deck/` (new or reworked deck), `engine/` (shared engine or design system), `fix/`, `docs/`, `chore/`.
- Commit as often as you like on the branch. Those commits get squashed away.
- Push the branch and open a pull request into `main`. Use a clear title and a short description of what changed and why. Include screenshots for visual changes.
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

## Quality checklist before committing

- [ ] Every slide fits 1600×900 with nothing clipped or overlapping (check with `O` overview too)
- [ ] Each slide has speaker notes
- [ ] No console errors
- [ ] Interactive elements work with mouse, keyboard and touch
- [ ] Facts have a source. Example companies are labelled illustrative
- [ ] Registry entry and home page card look right

## Deck backlog (ideas)

Well-Architected pillars · HA vs DR (RTO/RPO) · Landing zones · FinOps · Zero Trust · Cloud migration "6 Rs" · Multi-cloud vs single cloud · Identity as the new perimeter · Data residency and sovereignty.
