/* Shared Responsibility deck — interactions. Relies on assets/engine.js (window.CE). */
(function () {
  "use strict";

  /* ---------- Slide 3 · Pizza as a Service ---------- */
  // Bottom → top. Owner string in HTML is the same order: C = you, P = someone else.
  const PIZZA_LAYERS = [
    { icon: "🍅", name: "Dough, sauce & toppings" },
    { icon: "🔥", name: "Oven, gas & cooking" },
    { icon: "🍽️", name: "Table, plates & drinks" },
    { icon: "🥂", name: "Guests & conversation" },
  ];
  document.querySelectorAll(".pz-stack").forEach((stack) => {
    const owners = stack.dataset.owner.split("");
    PIZZA_LAYERS.forEach((l, i) => {
      const d = document.createElement("div");
      d.className = `pz-layer sk ${owners[i]}${i === PIZZA_LAYERS.length - 1 ? " top" : ""}`;
      d.innerHTML = `<span>${l.icon}</span><span>${l.name}</span><span class="who">${owners[i] === "C" ? "You" : "Them"}</span>`;
      stack.appendChild(d);
    });
  });

  /* ---------- Slide 5 · The layer stack ---------- */
  // C = customer (us), S = shared, P = provider. Columns: On-prem, IaaS, PaaS, SaaS.
  // Based on the layer model published by the major providers (e.g. Microsoft's).
  const LAYERS = [
    { icon: "🗂️", name: "Information & data", plain: "what we store", own: "CCCC" },
    { icon: "💻", name: "Devices", plain: "laptops & phones", own: "CCCC" },
    { icon: "🪪", name: "Accounts & identities", plain: "who can log in", own: "CCCC" },
    { icon: "🧭", name: "Identity infrastructure", plain: "the login system", own: "CCSS" },
    { icon: "🧩", name: "Applications", plain: "the software", own: "CCSP" },
    { icon: "🚧", name: "Network controls", plain: "firewalls & rules", own: "CCSP" },
    { icon: "⚙️", name: "Operating system", plain: "Windows / Linux", own: "CCPP" },
    { icon: "🖥️", name: "Physical servers", plain: "the hardware", own: "CPPP" },
    { icon: "🔌", name: "Physical network", plain: "cables & switches", own: "CPPP" },
    { icon: "🏭", name: "Physical datacentre", plain: "buildings, power, guards", own: "CPPP" },
  ];
  const MODELS = [
    {
      name: "On-premises",
      example: "Our own servers in our own building",
      text: "We own every layer, from the building's power and locks up to who can open each file.",
    },
    {
      name: "IaaS · Infrastructure as a Service",
      example: "e.g. virtual machines in AWS, Azure or Google Cloud",
      text: "We rent the hardware. The provider runs the buildings and machines. We still patch and secure everything we install on them.",
    },
    {
      name: "PaaS · Platform as a Service",
      example: "e.g. managed databases, app hosting platforms",
      text: "The provider also runs the operating system and the platform. We build and configure on top, and settings become a joint effort.",
    },
    {
      name: "SaaS · Software as a Service",
      example: "e.g. Microsoft 365, Salesforce, Workday",
      text: "We just use the software. But our data, our users and their devices are still ours to protect.",
    },
  ];
  const WHO = { C: "Us", S: "Shared", P: "Provider" };

  const stackEl = document.getElementById("floors");
  const lineEl = document.getElementById("the-line");
  const tabs = Array.from(document.querySelectorAll(".model-tabs .btn"));
  const layerEls = LAYERS.map((l) => {
    const d = document.createElement("div");
    d.className = "layer sk C";
    d.innerHTML = `<span class="l-icon">${l.icon}</span><span class="l-name">${l.name}</span><span class="l-plain">${l.plain}</span><span class="l-who">Us</span>`;
    stackEl.appendChild(d);
    return d;
  });
  let currentModel = -1;

  function setModel(m) {
    if (m === currentModel) return;
    currentModel = m;
    const counts = { C: 0, S: 0, P: 0 };
    LAYERS.forEach((l, i) => {
      const who = l.own[m];
      counts[who]++;
      const el = layerEls[i];
      const before = el.classList.contains(who);
      el.className = `layer sk ${who}`;
      el.querySelector(".l-who").textContent = WHO[who];
      if (!before) {
        // Stagger bumps bottom-up so the provider "rises" through the building.
        el.style.animationDelay = `${(LAYERS.length - 1 - i) * 45}ms`;
        void el.offsetWidth;
        el.classList.add("bump");
      }
    });
    // "The line": sits above the top-most floor the provider runs on its own.
    const firstP = LAYERS.findIndex((l) => l.own[m] === "P");
    if (firstP < 0) {
      lineEl.classList.add("is-hidden");
    } else {
      lineEl.classList.remove("is-hidden");
      const floor = layerEls[firstP];
      lineEl.style.top = `${floor.offsetTop - 4}px`;
    }
    tabs.forEach((t, i) => {
      t.classList.toggle("is-on", i === m);
      t.setAttribute("aria-selected", String(i === m));
    });
    document.getElementById("model-name").textContent = MODELS[m].name;
    document.getElementById("model-example").textContent = MODELS[m].example;
    document.getElementById("model-text").textContent = MODELS[m].text;
    document.getElementById("t-c").textContent = counts.C;
    document.getElementById("t-s").textContent = counts.S;
    document.getElementById("t-p").textContent = counts.P;
  }
  tabs.forEach((t) => t.addEventListener("click", () => setModel(Number(t.dataset.model))));
  setModel(0);

  // Keyboard → walks On-prem → IaaS → PaaS → SaaS via three invisible .step markers.
  const stackSlide = document.querySelector(".stack-slide");
  stackSlide.addEventListener("slide:step", (e) => setModel(e.detail.step));

  /* ---------- Slide 8 · Myth flip cards ---------- */
  document.querySelectorAll(".myth").forEach((m) =>
    m.addEventListener("click", () => m.classList.toggle("is-flipped"))
  );

  /* ---------- Quizzes (one config per <section data-quiz="…">) ---------- */
  const QUIZZES = {
    provider: {
      labels: { provider: "the provider", us: "us", both: "both of us" },
      summary: (sc) => {
        const ours = sc.filter((s) => s.answer !== "provider").length;
        const theirs = sc.length - ours;
        return `In ${ours} of the ${sc.length} scenarios, we were on the hook. The provider was solely to blame only ${theirs === 2 ? "twice" : theirs + " times"}.`;
      },
      scenarios: [
        { model: "IaaS / PaaS", answer: "us",
          text: "A storage bucket holding customer records is left open to the whole internet.",
          why: "The provider gave us the lock. Leaving it open was a configuration choice. This is one of the most common cloud breaches there is." },
        { model: "Any", answer: "both",
          text: "A flood takes out one of the provider's data centres. Our main system is down for a whole day.",
          why: "The building is theirs. Running everything in that one location, with no failover, was our design decision." },
        { model: "SaaS", answer: "us",
          text: "Someone who left three months ago logs into our CRM and downloads the full customer list.",
          why: "Accounts and access are always ours. Leavers should be switched off on day one." },
        { model: "IaaS", answer: "provider",
          text: "A flaw in the provider's virtualisation software lets another customer peek at our servers.",
          why: "The hypervisor and the physical hosts sit firmly on the provider's side of the line." },
        { model: "IaaS", answer: "us",
          text: "Ransomware gets into one of our virtual servers that hasn't been patched for a year.",
          why: "With IaaS, the operating system is ours to patch. The provider never touches it." },
        { model: "PaaS", answer: "provider",
          text: "The database engine in our managed database service needs an urgent security patch.",
          why: "With PaaS, the provider patches the platform. We still decide who can query the data and how it's configured." },
      ],
    },
    team: {
      labels: { coe: "the Cloud CoE", cpe: "Platform Engineering", app: "the app team" },
      summary: (sc) => {
        const app = sc.filter((s) => s.answer === "app").length;
        return `The app team owned ${app} of the ${sc.length}. The CoE sets the rules and runs the front door, Platform Engineering builds the platform, and app teams own what runs on it.`;
      },
      scenarios: [
        { model: "Network", answer: "cpe",
          text: "A new app needs a firewall rule opened so a partner can connect.",
          why: "Firewalls are a platform construct. Raise it in ServiceNow; the CoE routes it, and Platform Engineering makes the change." },
        { model: "Maintenance", answer: "app",
          text: "A critical security update is out for the operating system on an app's servers.",
          why: "Update management belongs to the app team. The CoE and CPE will flag it in their compliance reports, but applying it is the app team's job." },
        { model: "Governance", answer: "coe",
          text: "We need to change who can approve production changes.",
          why: "The CoE owns the change process and operational policy." },
        { model: "Onboarding", answer: "coe",
          text: "A team wants to move their app to the cloud but has never used Infrastructure as Code.",
          why: "They still follow tenant onboarding, and the CoE helps them build the IaC and DevOps capability they need." },
        { model: "Maintenance", answer: "app",
          text: "Backups for an app's database have been failing for a week.",
          why: "Backup is the app team's responsibility. The CoE and CPE advise and report, so this should show up in their compliance reports." },
        { model: "Network", answer: "cpe",
          text: "An app needs a connection back to the on-premises datacentre.",
          why: "Connectivity is a platform construct, so it's provisioned by the Platform Engineering team for that cloud, via a request to the CoE." },
      ],
    },
  };

  document.querySelectorAll("[data-quiz]").forEach((slide) => {
    const cfg = QUIZZES[slide.dataset.quiz];
    if (!cfg) return;
    const sc = cfg.scenarios;
    const $ = (sel) => slide.querySelector(sel);
    const q = {
      card: $(".quiz-card"), done: $(".quiz-done"),
      num: $(".q-num"), model: $(".q-model"), text: $(".q-text"),
      opts: Array.from(slide.querySelectorAll(".q-opt")),
      reveal: $(".q-reveal"), verdict: $(".q-verdict"), why: $(".q-why"),
      next: $(".q-next"), score: $(".q-score"),
    };
    let qi = 0, right = 0, answered = 0;

    function render() {
      const s = sc[qi];
      q.card.hidden = false;
      q.done.hidden = true;
      q.num.textContent = `Scenario ${qi + 1} of ${sc.length}`;
      q.model.textContent = s.model;
      q.text.textContent = s.text;
      q.reveal.hidden = true;
      q.opts.forEach((b) => { b.disabled = false; b.classList.remove("correct", "wrong"); });
      q.score.textContent = `${right} / ${answered}`;
    }

    q.opts.forEach((b) =>
      b.addEventListener("click", () => {
        const s = sc[qi];
        const ok = b.dataset.answer === s.answer;
        answered++;
        if (ok) right++;
        q.opts.forEach((o) => {
          o.disabled = true;
          if (o.dataset.answer === s.answer) o.classList.add("correct");
          else if (o === b) o.classList.add("wrong");
        });
        q.verdict.textContent = ok ? "✅ Spot on!" : `❌ It's ${cfg.labels[s.answer]}`;
        q.why.textContent = s.why;
        q.next.textContent = qi === sc.length - 1 ? "See results →" : "Next scenario →";
        q.reveal.hidden = false;
        q.score.textContent = `${right} / ${answered}`;
        q.next.focus({ preventScroll: true });
      })
    );

    q.next.addEventListener("click", () => {
      if (qi < sc.length - 1) { qi++; render(); return; }
      q.card.hidden = true;
      q.done.hidden = false;
      const pct = right / sc.length;
      $(".qd-emoji").textContent = pct === 1 ? "🏆" : pct >= 0.6 ? "🎉" : "🤔";
      $(".qd-title").textContent = `${right} out of ${sc.length}`;
      $(".qd-text").textContent = cfg.summary(sc);
    });

    $(".q-restart").addEventListener("click", () => { qi = 0; right = 0; answered = 0; render(); });
    render();
  });

  /* ---------- Who-does-what matrix: spotlight a team column ---------- */
  const matrix = document.querySelector(".matrix");
  if (matrix) {
    const picks = Array.from(matrix.querySelectorAll(".team-pick"));
    picks.forEach((btn) =>
      btn.addEventListener("click", () => {
        const col = btn.dataset.col;
        const on = matrix.dataset.spot === col ? "" : col;
        matrix.dataset.spot = on;
        picks.forEach((b) => b.classList.toggle("is-on", b.dataset.col === on));
      })
    );
  }

  /* ---------- Slide 10 · Tick boxes ---------- */
  document.querySelectorAll(".tick").forEach((t) =>
    t.addEventListener("click", () => {
      t.classList.toggle("is-on");
      t.setAttribute("aria-pressed", String(t.classList.contains("is-on")));
    })
  );
})();
