/* ==========================================================================
   cloud-explained — shared slide engine (no dependencies, no build step)

   Deck page contract:
     <body data-deck="<deck-id>">
       <div class="deck">
         <section class="slide"> ... <aside class="notes">speaker notes</aside></section>
       </div>
       <script src="../../decks/registry.js"></script>
       <script src="../../assets/engine.js"></script>
       <script src="deck.js"></script>   (optional, deck-specific interactions)

   Events dispatched on each <section class="slide">:
     slide:enter  { index }      — slide became active
     slide:leave  { index }      — slide stopped being active
     slide:step   { index, step } — a .step was revealed/hidden (step = count shown)

   Keyboard: → / Space / PgDn next · ← / PgUp back · Home / End · F fullscreen
             N notes · O overview · P presenter window · ? help · Esc close
   URL:      #/<n> deep-links to slide n (1-based)
             ?playlist=id1,id2 chains decks — the last slide offers "Up next"
   ========================================================================== */

(function () {
  "use strict";

  const SCRIPT_SRC = document.currentScript && document.currentScript.src;
  // Site root = folder above /assets/. Works on GitHub Pages sub-paths and locally.
  const ROOT = SCRIPT_SRC ? new URL("../", SCRIPT_SRC).href : "../../";

  const deckEl = document.querySelector(".deck");
  if (!deckEl) return;

  const slides = Array.from(deckEl.querySelectorAll(":scope > .slide"));
  const deckId = document.body.dataset.deck || "deck";
  const params = new URLSearchParams(location.search);
  const isPresenter = params.has("presenter");
  const playlist = (params.get("playlist") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const registry = Array.isArray(window.CE_DECKS) ? window.CE_DECKS : [];

  let index = 0;
  let stepCount = 0; // number of .step elements currently shown on the active slide
  let suppressBroadcast = false;

  /* ---------- Build chrome ---------- */

  const viewport = document.createElement("div");
  viewport.className = "ce-viewport";
  deckEl.parentNode.insertBefore(viewport, deckEl);
  viewport.appendChild(deckEl);

  const progress = el("div", "ce-progress");
  const controls = el("div", "ce-controls");
  controls.innerHTML = `
    <a href="${ROOT}index.html" title="All decks">⌂ Decks</a>
    <button type="button" data-act="prev" aria-label="Previous">←</button>
    <span class="ce-count" aria-live="polite"></span>
    <button type="button" data-act="next" aria-label="Next">→</button>
    <button type="button" data-act="notes" title="Speaker notes (N)">Notes</button>
    <button type="button" data-act="present" title="Open presenter window (P)">Presenter</button>
    <button type="button" data-act="full" title="Fullscreen (F)">⛶</button>
    <button type="button" data-act="help" title="Shortcuts (?)">?</button>`;
  const notes = el("div", "ce-notes");
  const help = el("div", "ce-help");
  help.innerHTML = `
    <div class="panel" role="dialog" aria-label="Keyboard shortcuts">
      <h3>Shortcuts</h3>
      <table>
        <tr><td><kbd>→</kbd> <kbd>Space</kbd></td><td>Next step / slide</td></tr>
        <tr><td><kbd>←</kbd></td><td>Back</td></tr>
        <tr><td><kbd>Home</kbd> <kbd>End</kbd></td><td>First / last slide</td></tr>
        <tr><td><kbd>F</kbd></td><td>Fullscreen</td></tr>
        <tr><td><kbd>N</kbd></td><td>Speaker notes</td></tr>
        <tr><td><kbd>P</kbd></td><td>Presenter window (stays in sync)</td></tr>
        <tr><td><kbd>O</kbd></td><td>Slide overview</td></tr>
        <tr><td><kbd>Esc</kbd></td><td>Close panels</td></tr>
      </table>
    </div>`;
  const timer = el("div", "ce-timer");
  const nextLink = el("a", "ce-next");
  [progress, controls, notes, help, timer, nextLink].forEach((n) => document.body.appendChild(n));

  /* ---------- Scaling ---------- */

  function fit() {
    if (document.body.classList.contains("ce-overview")) return;
    const w = deckEl.offsetWidth, h = deckEl.offsetHeight;
    const s = Math.min(window.innerWidth / w, window.innerHeight / h);
    deckEl.style.transform = `scale(${s})`;
  }
  window.addEventListener("resize", fit);

  /* ---------- Steps ---------- */

  function stepsOf(slide) {
    return Array.from(slide.querySelectorAll(".step"))
      .map((node, i) => ({ node, order: Number(node.dataset.step ?? i), i }))
      .sort((a, b) => a.order - b.order || a.i - b.i)
      .map((x) => x.node);
  }

  function applySteps(slide, count) {
    stepsOf(slide).forEach((node, i) => node.classList.toggle("is-shown", i < count));
  }

  /* ---------- Navigation ---------- */

  function show(newIndex, newStep, opts = {}) {
    newIndex = clamp(newIndex, 0, slides.length - 1);
    const prevSlide = slides[index];
    const changed = newIndex !== index || !prevSlide.classList.contains("is-active");

    if (changed && prevSlide.classList.contains("is-active")) {
      prevSlide.dispatchEvent(new CustomEvent("slide:leave", { detail: { index } }));
    }

    slides.forEach((s, i) => {
      s.classList.toggle("is-active", i === newIndex);
      s.classList.toggle("is-past", i < newIndex);
      s.setAttribute("aria-hidden", i === newIndex ? "false" : "true");
      if ("inert" in s) s.inert = i !== newIndex && !document.body.classList.contains("ce-overview");
    });

    const total = stepsOf(slides[newIndex]).length;
    newStep = newStep === "all" ? total : clamp(newStep, 0, total);
    const stepChanged = newStep !== stepCount || changed;

    index = newIndex;
    stepCount = newStep;
    applySteps(slides[index], stepCount);

    if (changed) slides[index].dispatchEvent(new CustomEvent("slide:enter", { detail: { index } }));
    if (stepChanged) slides[index].dispatchEvent(new CustomEvent("slide:step", { detail: { index, step: stepCount } }));

    updateChrome();
    if (!opts.fromHash) history.replaceState(null, "", `${location.pathname}${location.search}#/${index + 1}`);
    if (!suppressBroadcast) broadcast();
  }

  function next() {
    const total = stepsOf(slides[index]).length;
    if (stepCount < total) return show(index, stepCount + 1);
    if (index < slides.length - 1) return show(index + 1, 0);
    const nxt = nextDeck();
    if (nxt) location.href = nxt.href;
  }

  function prev() {
    if (stepCount > 0) return show(index, stepCount - 1);
    if (index > 0) show(index - 1, "all");
  }

  function updateChrome() {
    progress.style.width = `${((index + 1) / slides.length) * 100}%`;
    controls.querySelector(".ce-count").textContent = `${index + 1} / ${slides.length}`;
    const n = slides[index].querySelector("aside.notes");
    notes.innerHTML = `<h4><span>Speaker notes · slide ${index + 1}</span><span>N to hide</span></h4>${n ? n.innerHTML : "<p><em>No notes for this slide.</em></p>"}`;

    const nxt = nextDeck();
    const atEnd = index === slides.length - 1;
    nextLink.classList.toggle("is-visible", Boolean(nxt && atEnd));
    if (nxt) {
      nextLink.href = nxt.href;
      nextLink.textContent = `Up next: ${nxt.title} →`;
    }
  }

  /* ---------- Playlist ---------- */

  function nextDeck() {
    if (!playlist.length) return null;
    const pos = playlist.indexOf(deckId);
    const nextId = playlist[pos + 1];
    if (!nextId) return null;
    const meta = registry.find((d) => d.id === nextId);
    if (!meta) return null;
    return {
      title: meta.title,
      href: `${ROOT}${meta.path}?playlist=${encodeURIComponent(playlist.join(","))}`,
    };
  }

  /* ---------- Presenter sync ---------- */

  let channel = null;
  try { channel = new BroadcastChannel(`ce-${deckId}`); } catch (_) { /* unsupported */ }
  function broadcast() { if (channel) channel.postMessage({ index, step: stepCount }); }
  if (channel) {
    channel.onmessage = (e) => {
      const d = e.data || {};
      if (typeof d.index !== "number") return;
      suppressBroadcast = true;
      show(d.index, d.step);
      suppressBroadcast = false;
    };
  }

  function openPresenter() {
    const url = new URL(location.href);
    url.searchParams.set("presenter", "1");
    window.open(url.href, `ce-presenter-${deckId}`, "width=1100,height=760");
  }

  if (isPresenter) {
    document.body.classList.add("ce-presenter");
    notes.classList.add("is-open");
    const start = Date.now();
    const tick = () => {
      const s = Math.floor((Date.now() - start) / 1000);
      timer.textContent = `⏱ ${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Overview ---------- */

  function toggleOverview(force) {
    const on = force ?? !document.body.classList.contains("ce-overview");
    document.body.classList.toggle("ce-overview", on);
    if (on) {
      deckEl.style.transform = "none";
      slides.forEach((s) => { if ("inert" in s) s.inert = true; });
      slides[index].scrollIntoView({ block: "center" });
    } else {
      fit();
      show(index, stepCount);
    }
  }
  slides.forEach((s, i) =>
    s.addEventListener("click", () => {
      if (document.body.classList.contains("ce-overview")) { toggleOverview(false); show(i, 0); }
    })
  );
  // In overview, slides are inert, so catch clicks on the deck instead.
  deckEl.addEventListener("click", (e) => {
    if (!document.body.classList.contains("ce-overview")) return;
    const s = e.target.closest(".slide");
    if (s) { toggleOverview(false); show(slides.indexOf(s), 0); }
  });

  /* ---------- Input ---------- */

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  controls.addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "next") next();
    else if (act === "prev") prev();
    else if (act === "notes") notes.classList.toggle("is-open");
    else if (act === "present") openPresenter();
    else if (act === "full") toggleFullscreen();
    else if (act === "help") help.classList.toggle("is-open");
  });
  help.addEventListener("click", () => help.classList.remove("is-open"));

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    const typing = t.matches?.("input, textarea, select, [contenteditable]");
    const onControl = t.matches?.("button, a, [role=button]");
    if (typing) return;

    switch (e.key) {
      case "ArrowRight": case "PageDown": next(); break;
      case " ": if (onControl) return; next(); break;
      case "ArrowLeft": case "PageUp": prev(); break;
      case "Home": show(0, 0); break;
      case "End": show(slides.length - 1, "all"); break;
      case "f": case "F": toggleFullscreen(); break;
      case "n": case "N": notes.classList.toggle("is-open"); break;
      case "o": case "O": toggleOverview(); break;
      case "p": case "P": openPresenter(); break;
      case "?": help.classList.toggle("is-open"); break;
      case "Escape":
        help.classList.remove("is-open");
        if (document.body.classList.contains("ce-overview")) toggleOverview(false);
        break;
      default: return;
    }
    e.preventDefault();
  });

  // Touch swipe — ignored when the gesture starts on an interactive element.
  let touch = null;
  viewport.addEventListener("touchstart", (e) => {
    if (e.target.closest("button, a, input, [data-no-swipe]")) { touch = null; return; }
    touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  viewport.addEventListener("touchend", (e) => {
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch.x;
    const dy = e.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
    touch = null;
  });

  window.addEventListener("hashchange", () => {
    const n = readHash();
    if (n !== null && n !== index) show(n, 0, { fromHash: true });
  });

  /* ---------- Helpers ---------- */

  function readHash() {
    const m = location.hash.match(/^#\/(\d+)/);
    return m ? Number(m[1]) - 1 : null;
  }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function el(tag, cls) { const n = document.createElement(tag); n.className = cls; return n; }

  /* ---------- Public API for deck scripts ---------- */

  window.CE = { next, prev, goTo: (i, step = 0) => show(i, step), get index() { return index; }, slides, root: ROOT };

  /* ---------- Boot ---------- */

  fit();
  // Defer first render so deck.js (loaded after this file) can attach slide:enter listeners.
  const startAt = readHash() ?? 0;
  setTimeout(() => show(startAt, 0, { fromHash: true }), 0);
})();
