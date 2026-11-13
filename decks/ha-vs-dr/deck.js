/* HA vs DR deck — interactions. Relies on assets/engine.js (window.CE). */
(function () {
  "use strict";

  /* Cost meter: n of 4 pound signs filled (illustrative, relative cost only). */
  function renderCost(el, n, max = 4) {
    el.innerHTML = "";
    el.setAttribute("aria-label", `Cost ${n} out of ${max}`);
    for (let i = 0; i < max; i++) {
      const s = document.createElement("i");
      s.textContent = "£";
      if (i >= n) s.className = "off";
      el.appendChild(s);
    }
  }
  document.querySelectorAll(".cost-meter[data-cost]").forEach((el) => renderCost(el, Number(el.dataset.cost)));

  /* ---------- Slide 4 · Blast radius ---------- */
  const BLASTS = [
    {
      name: "💥 A server dies",
      text: "A disk fails or a machine crashes. It happens every day somewhere in every datacentre.",
      ha: ["ok", "✓ Covers it. Our twin copy takes over."],
      dr: ["na", "Not needed"],
      saviour: ".s-twin .app-chip",
    },
    {
      name: "🌊 A whole datacentre goes dark",
      text: "A power cut, fire or flood takes out one building. Rare, but it happens.",
      ha: ["ok", "✓ Covers it, because we spread across two"],
      dr: ["na", "Not needed"],
      saviour: ".s-twin .app-chip",
    },
    {
      name: "🗺️ A whole region goes down",
      text: "A wide outage hits every datacentre in one area, for hours. Very rare, very painful.",
      ha: ["no", "✗ Both our copies were in that region"],
      dr: ["ok", "✓ Switch over to Region 2"],
      saviour: ".standby",
    },
    {
      name: "🔒 Our data is damaged",
      text: "Ransomware scrambles our files, or someone deletes the wrong thing. Every building is fine.",
      ha: ["no", "✗ It copies the damage, instantly"],
      dr: ["ok", "✓ Restore last night's backup"],
      saviour: ".vault",
    },
  ];
  const blastMap = document.getElementById("blast-map");
  const blastTabs = Array.from(document.querySelectorAll(".blast-tabs .btn"));
  const vHa = document.getElementById("v-ha");
  const vDr = document.getElementById("v-dr");

  function setBlast(b) {
    const s = BLASTS[b];
    blastMap.dataset.state = String(b);
    blastMap.querySelectorAll(".is-saviour").forEach((el) => el.classList.remove("is-saviour"));
    blastMap.querySelectorAll(s.saviour).forEach((el) => el.classList.add("is-saviour"));
    document.getElementById("blast-name").textContent = s.name;
    document.getElementById("blast-text").textContent = s.text;
    vHa.className = `verdict sk ${s.ha[0]}`;
    vDr.className = `verdict sk ${s.dr[0]}`;
    document.getElementById("v-ha-says").textContent = s.ha[1];
    document.getElementById("v-dr-says").textContent = s.dr[1];
    blastTabs.forEach((t, i) => {
      t.classList.toggle("is-on", i === b);
      t.setAttribute("aria-selected", String(i === b));
    });
  }
  blastTabs.forEach((t) => t.addEventListener("click", () => setBlast(Number(t.dataset.blast))));
  document.querySelector(".blast-slide").addEventListener("slide:step", (e) => setBlast(e.detail.step));
  setBlast(0);

  /* ---------- Slide 5 · The nines ---------- */
  // Downtime is arithmetic on 365.25 days a year. "Takes" and cost are illustrative rules of thumb.
  const NINES = [
    { pct: 99, takes: "One server, fixed when it breaks. Fine for things nobody misses for a day.", cost: 1 },
    { pct: 99.9, takes: "One well-run server in the cloud, with good monitoring and fast repairs.", cost: 2 },
    { pct: 99.99, takes: "Copies in two or more datacentres (availability zones), with automatic switch-over.", cost: 3 },
    { pct: 99.999, takes: "Copies in several regions, automated everything, and a team on call around the clock.", cost: 4 },
  ];
  const YEAR_S = 365.25 * 24 * 3600;
  function fmt(seconds) {
    if (seconds >= 86400 * 1.5) return `${(seconds / 86400).toFixed(1)} days`;
    if (seconds >= 3600 * 1.5) return `${(seconds / 3600).toFixed(1)} hrs`;
    if (seconds >= 90) return `${Math.round(seconds / 60)} min`;
    return `${Math.round(seconds)} sec`;
  }
  const ninesTabs = Array.from(document.querySelectorAll(".nines-tabs .btn"));
  const takesCost = document.getElementById("takes-cost");
  function setNines(n) {
    const s = NINES[n];
    const down = YEAR_S * (1 - s.pct / 100);
    document.getElementById("dt-year").textContent = fmt(down);
    document.getElementById("dt-month").textContent = fmt(down / 12);
    document.getElementById("dt-week").textContent = fmt(down / 52.18);
    document.getElementById("takes-text").textContent = s.takes;
    renderCost(takesCost, s.cost);
    ninesTabs.forEach((t, i) => {
      t.classList.toggle("is-on", i === n);
      t.setAttribute("aria-selected", String(i === n));
    });
  }
  ninesTabs.forEach((t) => t.addEventListener("click", () => setNines(Number(t.dataset.nines))));
  document.querySelector(".nines-slide").addEventListener("slide:step", (e) => setNines(Math.min(e.detail.step, 3)));
  setNines(0);

  /* ---------- Slide 7 · RPO / RTO timeline ---------- */
  const RPO = ["zero", "5 minutes", "1 hour", "1 day", "1 week"];
  const RTO = ["seconds", "15 minutes", "4 hours", "1 day", "1 week"];
  const SEG_W = [0, 110, 220, 340, 460]; // px on the 1600×900 stage
  // Strictest requirement wins. Rough mapping to the four standard strategies (illustrative).
  const STRATEGY = [
    { name: "Active / active", why: "Two full copies, both live, in two regions.", cost: 4 },
    { name: "Warm standby", why: "A smaller copy always running, ready to take over.", cost: 3 },
    { name: "Pilot light", why: "Data copied constantly, servers ready to switch on.", cost: 2 },
    { name: "Backup & restore", why: "Safe copies, rebuilt when needed.", cost: 1 },
    { name: "Backup & restore", why: "Safe copies, rebuilt when needed. Cheapest by far.", cost: 1 },
  ];
  const rpoIn = document.getElementById("rpo");
  const rtoIn = document.getElementById("rto");
  const tlRpo = document.getElementById("tl-rpo");
  const tlRto = document.getElementById("tl-rto");
  const tlCost = document.getElementById("tl-cost");
  function updateTimeline() {
    const p = Number(rpoIn.value), t = Number(rtoIn.value);
    document.getElementById("rpo-out").textContent = RPO[p];
    document.getElementById("rto-out").textContent = RTO[t];
    rpoIn.setAttribute("aria-valuetext", RPO[p]);
    rtoIn.setAttribute("aria-valuetext", RTO[t]);
    tlRpo.style.width = `${SEG_W[p]}px`;
    tlRto.style.width = `${SEG_W[t]}px`;
    tlRpo.classList.toggle("is-zero", p === 0);
    tlRto.classList.toggle("is-zero", t === 0);
    const s = STRATEGY[Math.min(p, t)];
    document.getElementById("tl-strategy").textContent = s.name;
    document.getElementById("tl-why").textContent = s.why;
    renderCost(tlCost, s.cost);
  }
  rpoIn.addEventListener("input", updateTimeline);
  rtoIn.addEventListener("input", updateTimeline);
  updateTimeline();

  /* ---------- Slide 9 · Tiering ---------- */
  // Generic, illustrative systems and relative costs.
  const TIERS = [
    { id: "gold", medal: "🥇", label: "Gold · active/active", cost: 6 },
    { id: "silver", medal: "🥈", label: "Silver · pilot light", cost: 2 },
    { id: "bronze", medal: "🥉", label: "Bronze · backups", cost: 1 },
  ];
  const SYSTEMS = [
    { icon: "🛒", name: "Online checkout" },
    { icon: "💷", name: "Payroll" },
    { icon: "📧", name: "Email" },
    { icon: "📊", name: "Management reports" },
    { icon: "📚", name: "Staff intranet" },
    { icon: "🧪", name: "Test systems" },
  ];
  const tierGrid = document.getElementById("tier-grid");
  const tierOf = SYSTEMS.map(() => 0);
  const maxBill = SYSTEMS.length * TIERS[0].cost;
  const sysEls = SYSTEMS.map((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sys sk";
    b.innerHTML = `<span class="sys-emoji">${s.icon}</span><span class="sys-name">${s.name}</span><span class="sys-tier"></span><span class="sys-medal"></span>`;
    b.addEventListener("click", () => {
      tierOf[i] = (tierOf[i] + 1) % TIERS.length;
      renderSys(i);
      b.classList.remove("bump");
      void b.offsetWidth;
      b.classList.add("bump");
      renderBill();
    });
    tierGrid.appendChild(b);
    return b;
  });
  function renderSys(i) {
    const t = TIERS[tierOf[i]];
    const b = sysEls[i];
    b.classList.remove("gold", "silver", "bronze");
    b.classList.add(t.id);
    b.querySelector(".sys-tier").textContent = t.label;
    b.querySelector(".sys-medal").textContent = t.medal;
    b.setAttribute("aria-label", `${SYSTEMS[i].name}: ${t.label}. Click to change tier.`);
  }
  function renderBill() {
    const total = tierOf.reduce((sum, t) => sum + TIERS[t].cost, 0);
    const pct = Math.round((total / maxBill) * 100);
    document.getElementById("bill-fill").style.width = `${pct}%`;
    document.getElementById("bill-text").textContent = `${pct}% of the all-Gold price`;
  }
  SYSTEMS.forEach((_, i) => renderSys(i));
  renderBill();

  /* ---------- Slide 10 · Myth flip cards ---------- */
  document.querySelectorAll(".myth").forEach((m) =>
    m.addEventListener("click", () => m.classList.toggle("is-flipped"))
  );

  /* ---------- Slide 11 · Quiz ---------- */
  const SCENARIOS = [
    {
      text: "A server's hard drive fails at 2pm on a Tuesday.",
      answer: "ha",
      why: "Everyday failure. A twin copy takes over automatically and nobody notices.",
    },
    {
      text: "Someone deletes the customer table by mistake. It's copied to the standby within a second.",
      answer: "backup",
      why: "Every live copy now has the mistake too. Only a copy from before the deletion helps.",
    },
    {
      text: "One of the provider's datacentres loses power. We run in two of them.",
      answer: "ha",
      why: "Because we spread across datacentres (zones), the other one carries on.",
    },
    {
      text: "A major outage takes down every datacentre in our region for most of a day.",
      answer: "dr",
      why: "HA inside the region can't help. We need a copy somewhere else and a plan to switch to it.",
    },
    {
      text: "Ransomware encrypts our file servers overnight, and the encryption has spread to every copy.",
      answer: "backup",
      why: "We need a clean, protected backup from before the attack, ideally one that can't be changed.",
    },
    {
      text: "A regulator asks us to prove we could run from a different region if ours were lost.",
      answer: "dr",
      why: "That's a DR plan, plus evidence that we've actually tested it.",
    },
  ];
  const LABEL = { ha: "High availability", dr: "Failover to another region", backup: "A backup" };

  const q = {
    card: document.getElementById("quiz-card"),
    done: document.getElementById("quiz-done"),
    num: document.getElementById("q-num"),
    text: document.getElementById("q-text"),
    opts: Array.from(document.querySelectorAll(".q-opt")),
    reveal: document.getElementById("q-reveal"),
    verdict: document.getElementById("q-verdict"),
    why: document.getElementById("q-why"),
    next: document.getElementById("q-next"),
    score: document.getElementById("q-score"),
  };
  let qi = 0, right = 0, answered = 0;

  function renderQuestion() {
    const s = SCENARIOS[qi];
    q.card.hidden = false;
    q.done.hidden = true;
    q.num.textContent = `Scenario ${qi + 1} of ${SCENARIOS.length}`;
    q.text.textContent = s.text;
    q.reveal.hidden = true;
    q.opts.forEach((b) => { b.disabled = false; b.classList.remove("correct", "wrong"); });
    q.score.textContent = `${right} / ${answered}`;
  }

  q.opts.forEach((b) =>
    b.addEventListener("click", () => {
      const s = SCENARIOS[qi];
      const ok = b.dataset.answer === s.answer;
      answered++;
      if (ok) right++;
      q.opts.forEach((o) => {
        o.disabled = true;
        if (o.dataset.answer === s.answer) o.classList.add("correct");
        else if (o === b) o.classList.add("wrong");
      });
      q.verdict.textContent = ok ? "✅ Spot on!" : "❌ Not quite";
      q.why.textContent = ok ? s.why : `It's ${LABEL[s.answer].toLowerCase()}. ${s.why}`;
      q.next.textContent = qi === SCENARIOS.length - 1 ? "See results →" : "Next scenario →";
      q.reveal.hidden = false;
      q.score.textContent = `${right} / ${answered}`;
      q.next.focus({ preventScroll: true });
    })
  );

  q.next.addEventListener("click", () => {
    if (qi < SCENARIOS.length - 1) { qi++; renderQuestion(); return; }
    q.card.hidden = true;
    q.done.hidden = false;
    const pct = right / SCENARIOS.length;
    document.getElementById("qd-emoji").textContent = pct === 1 ? "🏆" : pct >= 0.6 ? "🎉" : "🤔";
    document.getElementById("qd-title").textContent = `${right} out of ${SCENARIOS.length}`;
    document.getElementById("qd-text").textContent =
      "High availability only saved us twice. For everything else, we needed a copy somewhere else, or from before things went wrong.";
  });

  document.getElementById("q-restart").addEventListener("click", () => {
    qi = 0; right = 0; answered = 0;
    renderQuestion();
  });
  renderQuestion();

  /* ---------- Slide 12 · Tick boxes ---------- */
  document.querySelectorAll(".tick").forEach((t) =>
    t.addEventListener("click", () => {
      t.classList.toggle("is-on");
      t.setAttribute("aria-pressed", String(t.classList.contains("is-on")));
    })
  );
})();
