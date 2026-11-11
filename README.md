# Cloud, Explained ☁️

Interactive, visual slide decks that explain core cloud architecture concepts to leadership and non-technical stakeholders, starting with the Shared Responsibility Model. Built for GitHub Pages.

**Live site:** https://davidjhole.github.io/cloud-explained/

## Decks

| Deck | Status |
|---|---|
| 🔑 **Who's Holding the Keys?** The Cloud Shared Responsibility Model | ✅ Ready |
| 🏛️ Six Pillars, One House: Well-Architected | Coming soon |
| 🛟 Spare Tyre or Second Car? HA vs DR | Coming soon |
| 🏗️ Build the Town Before the Houses: Landing zones | Coming soon |
| 💸 The Meter Is Always Running: FinOps | Coming soon |
| 🛂 Trust Nobody, Verify Everybody: Zero Trust | Coming soon |

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
| ? | Shortcuts |

Interactive slides (layer toggles, flip cards, the quiz) respond to clicks and taps, so you can hand the mouse to the room.

## Running locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Publishing

Go to **Settings → Pages** and choose **Deploy from a branch**, with `main` and `/ (root)`. There's no build step.

## Contributing a deck

See [`CLAUDE.md`](CLAUDE.md) for the tone, visual language and engine contract. To start a new deck, copy `decks/_template/` and register it in `decks/registry.js`.
