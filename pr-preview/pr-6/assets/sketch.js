/* ==========================================================================
   cloud-explained — sketch kit (the "whiteboard sketch" house style)

   Load at the end of <body>, before engine.js:
     <script src=".../assets/sketch.js"></script>

   It injects one hidden <svg> holding:
   - Filters that make edges look hand-drawn:
       #ce-rough       boxes, cards, buttons (used by .sk / .card / .btn / .pill / .note)
       #ce-rough-soft  smaller wobble for characters, icons and thin lines
   - Reusable doodles. Draw them with
       <svg class="doodle" viewBox="0 0 W H"><use href="#ce-doodle-…"/></svg>
     where W and H are the last two numbers of the symbol's viewBox. The outer
     viewBox must start at 0 0, or the drawing is offset inside its box:
       provider 140×150 · us 145×165 · person 100×165 · key 120×56
       cloud 640×360 · rack 82×132 · arrow 120×60
       #ce-doodle-provider   person in a hard hat holding a spanner (= the provider)
       #ce-doodle-us         person waving (= us / the client)
       #ce-doodle-person     plain team member; body colour via --doodle-body (default --customer)
       #ce-doodle-key        a key (= access / identity)
       #ce-doodle-cloud      a cloud outline
       #ce-doodle-rack       a server rack
       #ce-doodle-arrow      a curved arrow pointing right (rotate/flip it with CSS)
     All doodles are coloured with theme tokens, so they re-colour with the theme.
   ========================================================================== */
(function () {
  "use strict";

  const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">
  <defs>
    <filter id="ce-rough" filterUnits="userSpaceOnUse" x="-200" y="-200" width="4000" height="3000">
      <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="4" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="ce-rough-soft" filterUnits="userSpaceOnUse" x="-200" y="-200" width="4000" height="3000">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="9" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <pattern id="ce-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="12" stroke="var(--ink)" stroke-width="3" opacity=".18"/>
    </pattern>
  </defs>

  <!-- Provider: hard hat + spanner. viewBox fits the figure snugly. -->
  <symbol id="ce-doodle-provider" viewBox="-50 -22 140 150">
    <g filter="url(#ce-rough-soft)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M-40 124 Q -40 62 0 62 Q 40 62 40 124 Z" fill="var(--provider)"/>
      <circle cx="0" cy="30" r="30" fill="var(--skin)"/>
      <path d="M-34 22 Q -32 -16 0 -16 Q 32 -16 34 22 Z" fill="var(--sun)"/>
      <line x1="-42" y1="22" x2="42" y2="22" stroke-width="5"/>
      <path d="M30 84 L 70 52" stroke-width="5" fill="none"/>
      <path d="M66 42 l14 -8 l7 11 l-14 8 z" fill="var(--surface)" stroke-width="3"/>
    </g>
    <circle cx="-10" cy="36" r="3.5" fill="var(--ink)"/><circle cx="10" cy="36" r="3.5" fill="var(--ink)"/>
    <path d="M-9 47 Q 0 54 9 47" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
  </symbol>

  <!-- Us: waving person -->
  <symbol id="ce-doodle-us" viewBox="-90 -8 145 165">
    <g filter="url(#ce-rough-soft)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M-46 154 Q -46 72 0 72 Q 46 72 46 154 Z" fill="var(--customer)"/>
      <circle cx="0" cy="38" r="34" fill="var(--skin)"/>
      <path d="M-34 26 Q -30 -4 2 -2 Q 34 0 34 28 Q 18 12 -34 26 Z" fill="var(--hair)"/>
      <path d="M-38 98 L -80 44" stroke-width="5" fill="none"/>
    </g>
    <circle cx="-11" cy="42" r="3.5" fill="var(--ink)"/><circle cx="11" cy="42" r="3.5" fill="var(--ink)"/>
    <path d="M-10 56 Q 0 64 10 56" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
  </symbol>

  <!-- Person: a plain team member. Set the body colour per use with style="--doodle-body: var(--token)" -->
  <symbol id="ce-doodle-person" viewBox="-50 -8 100 165">
    <g filter="url(#ce-rough-soft)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M-46 154 Q -46 72 0 72 Q 46 72 46 154 Z" fill="var(--doodle-body, var(--customer))"/>
      <circle cx="0" cy="38" r="34" fill="var(--skin)"/>
      <path d="M-34 30 Q -34 -2 0 -2 Q 34 -2 34 30 Q 20 14 -6 16 Q -24 18 -34 30 Z" fill="var(--hair)"/>
    </g>
    <circle cx="-11" cy="42" r="3.5" fill="var(--ink)"/><circle cx="11" cy="42" r="3.5" fill="var(--ink)"/>
    <path d="M-10 56 Q 0 63 10 56" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
  </symbol>

  <!-- Key -->
  <symbol id="ce-doodle-key" viewBox="-28 -28 120 56">
    <g filter="url(#ce-rough-soft)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round">
      <circle cx="0" cy="0" r="22" fill="var(--sun)"/>
      <circle cx="0" cy="0" r="7" fill="var(--paper)" stroke-width="3"/>
      <path d="M20 -6 L 84 -6 L 84 6 L 74 6 L 74 18 L 63 18 L 63 6 L 20 6" fill="var(--sun)"/>
    </g>
  </symbol>

  <!-- Cloud -->
  <symbol id="ce-doodle-cloud" viewBox="0 30 640 360">
    <path filter="url(#ce-rough)" d="M120 300 C 40 300 20 210 90 190 C 80 110 190 80 230 140 C 260 50 420 40 450 150 C 540 120 620 200 570 280 C 640 300 620 380 540 380 L 140 380 C 60 380 50 300 120 300 Z"
          fill="var(--provider-soft)" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round"/>
  </symbol>

  <!-- Server rack -->
  <symbol id="ce-doodle-rack" viewBox="-6 -6 82 132">
    <g filter="url(#ce-rough-soft)" stroke="var(--ink)" stroke-width="4" stroke-linecap="round">
      <rect x="0" y="0" width="70" height="120" rx="8" fill="var(--surface)"/>
      <rect x="0" y="0" width="70" height="120" rx="8" fill="url(#ce-hatch)"/>
      <line x1="14" y1="25" x2="56" y2="25"/><line x1="14" y1="50" x2="56" y2="50"/><line x1="14" y1="75" x2="56" y2="75"/>
    </g>
    <circle cx="48" cy="100" r="5" fill="var(--good)"/>
  </symbol>

  <!-- Curved arrow, pointing right -->
  <symbol id="ce-doodle-arrow" viewBox="0 0 120 60">
    <g filter="url(#ce-rough-soft)" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 48 Q 50 4 108 22"/>
      <path d="M90 10 L 110 22 L 92 36"/>
    </g>
  </symbol>
</svg>`;

  function inject() {
    if (document.getElementById("ce-doodle-provider")) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = SVG.trim();
    document.body.insertBefore(wrap.firstChild, document.body.firstChild);
  }
  if (document.body) inject();
  else document.addEventListener("DOMContentLoaded", inject);
})();
