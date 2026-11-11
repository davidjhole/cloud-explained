# Cloud, Explained ☁️

Interactive, visual slide decks that explain core cloud architecture concepts to leadership and non-technical stakeholders, starting with the Shared Responsibility Model. Built for GitHub Pages.

**Live site:** https://davidjhole.github.io/cloud-explained/

## Decks

| Deck | Slides | Time |
|---|---|---|
| 🔑 **Who's Holding the Keys?** The Cloud Shared Responsibility Model | 12 | ~15 min |

More topics are on the way. See the backlog in [`CLAUDE.md`](CLAUDE.md).

## Presenting

1. Open the site and tick one or more decks. They play in the order you tick them.
2. Click **Present**.
3. Use these keys while presenting:

| Key | Action |
|---|---|
| → / Space | Next step or slide |
| ← | Back |
| F | Fullscreen |
| N | Speaker notes |
| P | Presenter window (notes + timer, kept in sync with the main screen) |
| O | Overview of all slides |
| T | Theme & client colours |
| ? | Shortcuts |

### Matching a client's brand

Press **T**, or click **🎨 Theme**, on the home page or in any deck:

- Pick a preset, or edit any colour.
- **Upload the client's logo.** Its colours are pulled out automatically, and you can show the logo on every slide.
- Save the result as a named theme for next time, or copy a share link that carries it.

Everything stays in your browser. Nothing is uploaded.

Interactive slides (layer toggles, flip cards, the quiz) respond to clicks and taps, so you can hand the mouse to the room.

## Running locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Publishing

Go to **Settings → Pages** and choose **Deploy from a branch**, with `main` and `/ (root)`. There's no build step.

## Contributing a deck

See [`CLAUDE.md`](CLAUDE.md) for the tone, the theming rules every slide must follow, the engine contract and the git workflow (branch → PR → squash merge). To start a new deck, copy `decks/_template/` and register it in `decks/registry.js`.
