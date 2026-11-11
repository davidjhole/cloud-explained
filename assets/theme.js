/* ==========================================================================
   cloud-explained — theme runtime (no dependencies)

   Load in <head>, after assets/themes.js, so colours apply before first paint:
     <script src=".../assets/themes.js"></script>
     <script src=".../assets/theme.js"></script>

   What it does
   - Applies the active theme's tokens as CSS variables on <html>, plus derived
     variables (tints, borders, muted text, readable text-on-colour).
   - Remembers the choice in localStorage, so it follows you from the home page
     into every deck and across a playlist, and syncs between open windows
     (e.g. the presenter window).
   - ?theme=<preset-id> or ?theme=~<code> in the URL overrides it (share links).
   - Provides the theme panel: presets, a colour editor, "get colours from a
     logo", an optional client logo on every slide, saved custom themes.

   API: window.CETheme.open(), .close(), .toggle(), .apply(tokens), .current()
   Event: "ce:themechange" on window, detail = { tokens, presetId }
   ========================================================================== */
(function () {
  "use strict";

  const STORE = "ce-theme-v1";
  const PRESETS = Array.isArray(window.CE_THEMES) && window.CE_THEMES.length ? window.CE_THEMES : [];
  const DEFAULT = PRESETS[0] ? PRESETS[0].tokens : {};

  // Editable tokens with plain-English labels (order = editor order)
  const FIELDS = [
    ["customer", "Primary brand colour", "Used for “us” / the client"],
    ["provider", "Secondary colour", "Used for “the provider”"],
    ["shared", "Third accent", "Used for “shared”"],
    ["sun", "Highlight", "Emphasis, underlines, calls to action"],
    ["ink", "Text & dark slides", "Headings, outlines, dark slide background"],
    ["paper", "Slide background", ""],
    ["surface", "Cards", "Cards, panels and buttons"],
    ["good", "Correct", "Quiz answers, ticks"],
    ["bad", "Incorrect", "Quiz answers, myths"],
  ];
  const KEYS = FIELDS.map((f) => f[0]);

  let panel = null;              // theme panel element (built on first open)
  let selectedField = "customer"; // token a logo swatch click will set

  /* ---------- Colour maths ---------- */

  function hexToRgb(hex) {
    let h = String(hex || "").trim().replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    if (!/^[0-9a-f]{6}$/i.test(h)) return null;
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const rgbToHex = (rgb) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
  function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    if (!A || !B) return a;
    return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
  }
  function lum(hex) {
    const c = hexToRgb(hex);
    if (!c) return 0;
    const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function contrast(a, b) {
    const L1 = lum(a), L2 = lum(b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }
  // Best readable text colour on a fill: white or a near-black
  function onColour(fill) {
    return contrast(fill, "#ffffff") >= contrast(fill, "#14162b") ? "#ffffff" : "#14162b";
  }
  function sanitise(tokens) {
    const out = {};
    KEYS.forEach((k) => { out[k] = hexToRgb(tokens && tokens[k]) ? rgbToHex(hexToRgb(tokens[k])) : DEFAULT[k]; });
    return out;
  }

  /* ---------- Derive + apply ---------- */

  function derive(t) {
    const isDark = lum(t.paper) < 0.18;
    const v = {
      paper: t.paper, surface: t.surface, ink: t.ink,
      customer: t.customer, provider: t.provider, shared: t.shared,
      sun: t.sun, good: t.good, bad: t.bad,

      "paper-2": mix(t.paper, t.ink, 0.06),
      line: mix(t.paper, t.ink, 0.18),
      dot: mix(t.paper, t.ink, isDark ? 0.14 : 0.1),
      "ink-soft": mix(t.ink, t.paper, 0.3),
      "ink-faint": mix(t.ink, t.paper, 0.5),
      // .dark "statement" slides: ink background in light themes, an extra-deep
      // version of the background in dark themes, so they always stand out.
      deep: isDark ? mix(t.paper, "#000000", 0.45) : t.ink,
      "on-deep": isDark ? t.ink : (contrast(t.ink, t.paper) >= 3 ? t.paper : onColour(t.ink)),
      "deep-2": isDark ? mix(t.paper, "#000000", 0.2) : mix(t.ink, t.paper, 0.1),
      "on-ink": contrast(t.ink, t.paper) >= 3 ? t.paper : onColour(t.ink),
      "on-ink-soft": mix(contrast(t.ink, t.paper) >= 3 ? t.paper : onColour(t.ink), t.ink, 0.22),

      "customer-soft": mix(t.surface, t.customer, 0.16),
      "provider-soft": mix(t.surface, t.provider, 0.16),
      "shared-soft": mix(t.surface, t.shared, 0.16),
      "sun-soft": mix(t.surface, t.sun, 0.22),
      "good-soft": mix(t.surface, t.good, 0.14),
      "customer-deep": mix(t.customer, "#000000", 0.18),
      "provider-deep": mix(t.provider, "#000000", 0.18),
      "shared-deep": mix(t.shared, "#000000", 0.18),
      "shared-light": mix(t.shared, "#ffffff", 0.3),

      "on-customer": onColour(t.customer),
      "on-provider": onColour(t.provider),
      "on-shared": onColour(t.shared),
      "on-sun": onColour(t.sun),
      "on-good": onColour(t.good),
      "on-bad": onColour(t.bad),

      "ink-rgb": (hexToRgb(t.ink) || [0, 0, 0]).join(", "),
      "scheme": isDark ? "dark" : "light",
    };
    v["on-deep-soft"] = mix(v["on-deep"], v.deep, 0.25);
    return v;
  }

  let state = load();
  let active = sanitise(state.tokens || DEFAULT);

  function apply(tokens, opts = {}) {
    active = sanitise(tokens);
    const vars = derive(active);
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, val]) => root.style.setProperty(`--${k}`, val));
    root.style.colorScheme = vars.scheme;
    root.dataset.themeScheme = vars.scheme;
    if (!opts.silent) window.dispatchEvent(new CustomEvent("ce:themechange", { detail: { tokens: { ...active }, presetId: state.presetId } }));
    if (panel) syncPanel();
  }

  /* ---------- Persistence ---------- */

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (_) { return {}; }
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); }
    catch (_) {
      // Most likely the logo is too big for storage: keep everything else.
      try { const { logo, ...rest } = state; localStorage.setItem(STORE, JSON.stringify(rest)); } catch (__) { /* ignore */ }
    }
  }
  function setTheme(tokens, presetId = null) {
    state.tokens = sanitise(tokens);
    state.presetId = presetId;
    save();
    apply(state.tokens);
  }

  // Keep other windows (presenter view, other tabs) in step
  window.addEventListener("storage", (e) => {
    if (e.key !== STORE) return;
    state = load();
    apply(state.tokens || DEFAULT);
    renderLogo();
  });

  /* ---------- Share codes ---------- */

  function encode(tokens) {
    const s = KEYS.map((k) => tokens[k].slice(1)).join("");
    return "~" + s;
  }
  function decode(code) {
    const s = String(code || "").replace(/^~/, "");
    if (!/^[0-9a-f]+$/i.test(s) || s.length !== KEYS.length * 6) return null;
    const t = {};
    KEYS.forEach((k, i) => { t[k] = "#" + s.slice(i * 6, i * 6 + 6); });
    return t;
  }
  function shareUrl() {
    const url = new URL(location.href);
    url.searchParams.set("theme", state.presetId || encode(active));
    url.hash = location.hash;
    return url.href;
  }

  // URL override (?theme=midnight or ?theme=~abc123...)
  (function readUrl() {
    const q = new URLSearchParams(location.search).get("theme");
    if (!q) return;
    const preset = PRESETS.find((p) => p.id === q);
    const decoded = preset ? preset.tokens : decode(q);
    if (decoded) { state.tokens = sanitise(decoded); state.presetId = preset ? preset.id : null; save(); }
  })();

  // Initial paint (runs in <head>, before the page renders)
  if (!state.tokens) { state.tokens = sanitise(DEFAULT); state.presetId = PRESETS[0] && PRESETS[0].id; }
  apply(state.tokens, { silent: true });

  /* ---------- Client logo on slides ---------- */

  function renderLogo() {
    document.querySelectorAll(".ce-client-logo").forEach((n) => n.remove());
    if (!state.logo || !state.showLogo) return;
    const host = document.querySelector(".deck") || document.querySelector("[data-logo-slot]");
    if (!host) return;
    const img = document.createElement("img");
    img.className = "ce-client-logo";
    img.alt = "Client logo";
    img.src = state.logo;
    host.appendChild(img);
  }

  /* ---------- Palette extraction from a logo ---------- */

  function extractPalette(img) {
    const size = 72;
    const c = document.createElement("canvas");
    const ratio = Math.min(size / img.width, size / img.height, 1);
    c.width = Math.max(1, Math.round(img.width * ratio));
    c.height = Math.max(1, Math.round(img.height * ratio));
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    const buckets = new Map();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 200) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const key = (r >> 4) + "," + (g >> 4) + "," + (b >> 4);
      const e = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
      e.n++; e.r += r; e.g += g; e.b += b;
      buckets.set(key, e);
    }
    const total = Array.from(buckets.values()).reduce((sum, e) => sum + e.n, 0) || 1;
    let cols = Array.from(buckets.values())
      .filter((e) => e.n / total > 0.02) // ignore anti-aliased edge pixels
      .map((e) => ({ hex: rgbToHex([e.r / e.n, e.g / e.n, e.b / e.n]), n: e.n }));
    cols.sort((a, b) => b.n - a.n);
    const picked = [];
    cols.forEach((col) => {
      const rgb = hexToRgb(col.hex);
      const close = picked.some((p) => { const q = hexToRgb(p.hex); return Math.hypot(rgb[0] - q[0], rgb[1] - q[1], rgb[2] - q[2]) < 60; });
      if (!close) picked.push(col);
    });
    // drop near-white backgrounds
    return picked.filter((p) => lum(p.hex) < 0.9).slice(0, 8).map((p) => p.hex);
  }
  function saturation(hex) {
    const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return mx === 0 ? 0 : (mx - mn) / mx;
  }
  // Suggest a mapping from a logo palette onto the theme tokens
  function suggestFromPalette(palette) {
    const t = { ...active };
    const colourful = palette.filter((h) => saturation(h) > 0.25 && lum(h) > 0.03);
    const darks = palette.filter((h) => lum(h) < 0.06);
    if (colourful[0]) t.customer = colourful[0];
    if (colourful[1]) t.provider = colourful[1];
    else if (colourful[0]) t.provider = mix(colourful[0], "#1b1f3b", 0.45);
    if (colourful[2]) t.shared = colourful[2];
    if (darks[0] && lum(t.paper) > 0.5) t.ink = darks[0];
    return t;
  }

  /* ---------- Panel UI ---------- */

  function buildPanel() {
    panel = document.createElement("div");
    panel.className = "ce-theme";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Theme");
    panel.innerHTML = `
      <div class="ce-theme__panel">
        <header class="ce-theme__head">
          <h3>🎨 Theme</h3>
          <button type="button" class="ce-theme__x" data-act="close" aria-label="Close">✕</button>
        </header>
        <div class="ce-theme__body">
          <section>
            <h4>Presets</h4>
            <div class="ce-theme__presets"></div>
          </section>
          <section class="ce-theme__saved-wrap">
            <h4>Saved themes</h4>
            <div class="ce-theme__saved"></div>
          </section>
          <section>
            <h4>Match a client's brand</h4>
            <label class="ce-theme__drop">
              <input type="file" accept="image/*" data-act="logo-file" hidden>
              <span>⬆︎ Upload their logo</span><small>We'll pull out its colours. Nothing leaves this browser.</small>
            </label>
            <div class="ce-theme__logo-row" hidden>
              <img class="ce-theme__logo-preview" alt="Uploaded logo">
              <div>
                <div class="ce-theme__palette"></div>
                <small>Click a swatch to use it for the highlighted colour below.</small>
                <div class="ce-theme__row">
                  <button type="button" class="ce-theme__btn" data-act="auto">✨ Auto-apply colours</button>
                  <label class="ce-theme__check"><input type="checkbox" data-act="show-logo"> Show logo on slides</label>
                  <button type="button" class="ce-theme__link" data-act="remove-logo">Remove logo</button>
                </div>
              </div>
            </div>
          </section>
          <section>
            <h4>Colours</h4>
            <div class="ce-theme__fields"></div>
            <div class="ce-theme__warn" role="status"></div>
          </section>
        </div>
        <footer class="ce-theme__foot">
          <button type="button" class="ce-theme__btn" data-act="save">💾 Save as…</button>
          <button type="button" class="ce-theme__btn" data-act="share">🔗 Copy share link</button>
          <button type="button" class="ce-theme__link" data-act="reset">Reset to default</button>
        </footer>
      </div>`;
    document.body.appendChild(panel);

    // presets
    const pWrap = panel.querySelector(".ce-theme__presets");
    PRESETS.forEach((p) => pWrap.appendChild(swatchCard(p.name, p.tokens, () => setTheme(p.tokens, p.id), p.id)));

    // fields
    const fWrap = panel.querySelector(".ce-theme__fields");
    FIELDS.forEach(([k, label, hint]) => {
      const row = document.createElement("div");
      row.className = "ce-theme__field";
      row.dataset.key = k;
      row.innerHTML = `
        <input type="color" aria-label="${label}">
        <div class="ce-theme__label"><b>${label}</b>${hint ? `<small>${hint}</small>` : ""}</div>
        <input type="text" class="ce-theme__hex" maxlength="7" spellcheck="false" aria-label="${label} hex">`;
      const colour = row.querySelector("input[type=color]");
      const hex = row.querySelector(".ce-theme__hex");
      const update = (val) => { if (hexToRgb(val)) setTheme({ ...active, [k]: val }, null); };
      colour.addEventListener("input", () => update(colour.value));
      hex.addEventListener("change", () => update(hex.value.startsWith("#") ? hex.value : "#" + hex.value));
      row.addEventListener("focusin", () => selectField(k));
      row.addEventListener("click", () => selectField(k));
      fWrap.appendChild(row);
    });

    panel.addEventListener("click", (e) => {
      if (e.target === panel) return close();
      const act = e.target.closest("[data-act]")?.dataset.act;
      if (act === "close") close();
      else if (act === "reset") { setTheme(DEFAULT, PRESETS[0] && PRESETS[0].id); }
      else if (act === "share") copyShare(e.target.closest("button"));
      else if (act === "save") saveCurrent();
      else if (act === "auto") { if (state.palette) setTheme(suggestFromPalette(state.palette), null); }
      else if (act === "remove-logo") { state.logo = null; state.palette = null; state.showLogo = false; save(); renderLogo(); syncPanel(); }
    });
    panel.querySelector("[data-act=show-logo]").addEventListener("change", (e) => {
      state.showLogo = e.target.checked; save(); renderLogo();
    });
    panel.querySelector("[data-act=logo-file]").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) readLogo(file);
      e.target.value = "";
    });
    panel.addEventListener("keydown", (e) => {
      e.stopPropagation(); // don't drive the slides while editing
      if (e.key === "Escape") close();
    });
    syncPanel();
  }

  function swatchCard(name, tokens, onClick, id, onDelete) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ce-theme__preset";
    if (id) b.dataset.id = id;
    const t = sanitise(tokens);
    b.innerHTML = `
      <span class="ce-theme__mini" style="background:${t.paper};border-color:${t.ink}">
        <i style="background:${t.customer}"></i><i style="background:${t.provider}"></i><i style="background:${t.shared}"></i><i style="background:${t.sun}"></i>
      </span><span class="ce-theme__name">${escapeHtml(name)}</span>${onDelete ? `<span class="ce-theme__del" title="Delete">✕</span>` : ""}`;
    b.addEventListener("click", (e) => {
      if (onDelete && e.target.closest(".ce-theme__del")) { e.stopPropagation(); onDelete(); return; }
      onClick();
    });
    return b;
  }

  function selectField(k) {
    selectedField = k;
    panel.querySelectorAll(".ce-theme__field").forEach((r) => r.classList.toggle("is-selected", r.dataset.key === k));
  }

  function syncPanel() {
    if (!panel) return;
    panel.querySelectorAll(".ce-theme__field").forEach((row) => {
      const k = row.dataset.key;
      row.querySelector("input[type=color]").value = active[k];
      const hex = row.querySelector(".ce-theme__hex");
      if (document.activeElement !== hex) hex.value = active[k];
    });
    selectField(selectedField);
    panel.querySelectorAll(".ce-theme__presets .ce-theme__preset").forEach((b) => b.classList.toggle("is-on", b.dataset.id === state.presetId));

    // saved themes
    const saved = state.saved || [];
    const sWrap = panel.querySelector(".ce-theme__saved");
    panel.querySelector(".ce-theme__saved-wrap").hidden = !saved.length;
    sWrap.innerHTML = "";
    saved.forEach((s, i) => sWrap.appendChild(swatchCard(s.name, s.tokens, () => setTheme(s.tokens, null), null, () => {
      state.saved.splice(i, 1); save(); syncPanel();
    })));

    // logo
    const row = panel.querySelector(".ce-theme__logo-row");
    row.hidden = !state.logo;
    if (state.logo) {
      panel.querySelector(".ce-theme__logo-preview").src = state.logo;
      panel.querySelector("[data-act=show-logo]").checked = Boolean(state.showLogo);
      const pal = panel.querySelector(".ce-theme__palette");
      pal.innerHTML = "";
      (state.palette || []).forEach((hex) => {
        const sw = document.createElement("button");
        sw.type = "button";
        sw.className = "ce-theme__chip";
        sw.style.background = hex;
        sw.title = hex;
        sw.addEventListener("click", () => setTheme({ ...active, [selectedField]: hex }, null));
        pal.appendChild(sw);
      });
    }

    // contrast warnings
    const warns = [];
    if (contrast(active.ink, active.paper) < 4.5) warns.push("Text may be hard to read on the slide background.");
    if (contrast(active.ink, active.surface) < 4.5) warns.push("Text may be hard to read on cards.");
    if (contrast(active.customer, active.provider) < 1.4) warns.push("Primary and secondary colours look very similar, so “us” vs “provider” may be hard to tell apart.");
    panel.querySelector(".ce-theme__warn").innerHTML = warns.map((w) => `⚠️ ${w}`).join("<br>");
  }

  function readLogo(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // downscale for storage
        const max = 360;
        const r = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        state.logo = c.toDataURL("image/png");
        state.palette = extractPalette(img);
        state.showLogo = true;
        save();
        renderLogo();
        syncPanel();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function saveCurrent() {
    const name = (prompt("Name this theme (e.g. the client's name):") || "").trim();
    if (!name) return;
    state.saved = (state.saved || []).filter((s) => s.name !== name);
    state.saved.push({ name, tokens: { ...active } });
    save();
    syncPanel();
  }

  function copyShare(btn) {
    const url = shareUrl();
    const done = () => { const t = btn.textContent; btn.textContent = "✓ Copied"; setTimeout(() => (btn.textContent = t), 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => prompt("Copy this link:", url));
    else prompt("Copy this link:", url);
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  function open() { if (!panel) buildPanel(); panel.classList.add("is-open"); syncPanel(); panel.querySelector(".ce-theme__preset")?.focus(); }
  function close() { if (panel) panel.classList.remove("is-open"); }
  function toggle() { if (panel && panel.classList.contains("is-open")) close(); else open(); }

  window.CETheme = {
    open, close, toggle,
    apply: (tokens) => setTheme(tokens, null),
    current: () => ({ ...active }),
    presets: PRESETS,
    shareUrl,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderLogo);
  else renderLogo();
})();
