/* ==========================================================================
   Theme presets. Every deck and the home page are coloured ONLY from these tokens.

   Token meanings are fixed across all decks:
     paper     Slide background
     surface   Cards, panels, buttons
     ink       Main text, outlines and the background of .dark slides
     customer  "Us" / the client. Use the client's PRIMARY brand colour here.
     provider  "The cloud provider" / someone else. Use a SECONDARY brand colour here.
     shared    Shared responsibility / a third accent
     sun       Highlights, emphasis, calls to action
     good/bad  Correct / incorrect

   Everything else (soft tints, borders, muted text, text-on-colour) is
   derived automatically by assets/theme.js, so a theme only needs these.

   To add a preset, append an object with a unique kebab-case id.
   Don't commit a client's brand theme to this public repo unless they're happy
   for it to be public. Use the in-app editor instead; it saves in the browser.
   ========================================================================== */
window.CE_THEMES = [
  {
    id: "default",
    name: "Cloud Explained",
    tokens: {
      paper: "#f6f1e7", surface: "#ffffff", ink: "#1b1f3b",
      customer: "#ff6b4a", provider: "#2d6bff", shared: "#8b5cf6",
      sun: "#ffc93c", good: "#1faf7a", bad: "#e5484d",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    tokens: {
      paper: "#12152b", surface: "#1e2342", ink: "#eef0fb",
      customer: "#ff7a5c", provider: "#5b8cff", shared: "#a78bfa",
      sun: "#ffd25e", good: "#34d399", bad: "#f87171",
    },
  },
  {
    id: "corporate",
    name: "Corporate",
    tokens: {
      paper: "#f4f6f9", surface: "#ffffff", ink: "#0f2742",
      customer: "#0a7c86", provider: "#1f4e9c", shared: "#6b5ca5",
      sun: "#f2b705", good: "#2e8540", bad: "#c62828",
    },
  },
  {
    id: "forest",
    name: "Forest",
    tokens: {
      paper: "#f3f5ee", surface: "#ffffff", ink: "#1c2b22",
      customer: "#e07a2e", provider: "#2f6f4e", shared: "#7a6aa8",
      sun: "#f1c84b", good: "#3c9a5f", bad: "#c8463d",
    },
  },
  {
    id: "mono",
    name: "Print / mono",
    tokens: {
      paper: "#ffffff", surface: "#ffffff", ink: "#111111",
      customer: "#111111", provider: "#8a8a8a", shared: "#c4c4c4",
      sun: "#e6e6e6", good: "#111111", bad: "#8a8a8a",
    },
  },
];
