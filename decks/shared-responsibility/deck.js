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

  /* ---------- Slide 9 · Quiz ---------- */
  const SCENARIOS = [
    {
      model: "IaaS / PaaS",
      text: "A storage bucket holding customer records is left open to the whole internet.",
      answer: "us",
      why: "The provider gave us the lock. Leaving it open was a configuration choice. This is one of the most common cloud breaches there is.",
    },
    {
      model: "Any",
      text: "A flood takes out one of the provider's data centres. Our main system is down for a whole day.",
      answer: "both",
      why: "The building is theirs. Running everything in that one location, with no failover, was our design decision.",
    },
    {
      model: "SaaS",
      text: "Someone who left three months ago logs into our CRM and downloads the full customer list.",
      answer: "us",
      why: "Accounts and access are always ours. Leavers should be switched off on day one.",
    },
    {
      model: "IaaS",
      text: "A flaw in the provider's virtualisation software lets another customer peek at our servers.",
      answer: "provider",
      why: "The hypervisor and the physical hosts sit firmly on the provider's side of the line.",
    },
    {
      model: "IaaS",
      text: "Ransomware gets into one of our virtual servers that hasn't been patched for a year.",
      answer: "us",
      why: "With IaaS, the operating system is ours to patch. The provider never touches it.",
    },
    {
      model: "PaaS",
      text: "The database engine in our managed database service needs an urgent security patch.",
      answer: "provider",
      why: "With PaaS, the provider patches the platform. We still decide who can query the data and how it's configured.",
    },
  ];
  const LABEL = { provider: "The provider", us: "Us", both: "Both of us" };

  const q = {
    card: document.getElementById("quiz-card"),
    done: document.getElementById("quiz-done"),
    num: document.getElementById("q-num"),
    model: document.getElementById("q-model"),
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
    q.model.textContent = s.model;
    q.text.textContent = s.text;
    q.reveal.hidden = true;
    q.opts.forEach((b) => { b.disabled = false; b.classList.remove("correct", "wrong"); });
    q.score.textContent = `${right} / ${answered}`;
  }

  q.opts.forEach((b) =>
    b.addEventListener("click", () => {
      const s = SCENARIOS[qi];
      const picked = b.dataset.answer;
      const ok = picked === s.answer;
      answered++;
      if (ok) right++;
      q.opts.forEach((o) => {
        o.disabled = true;
        if (o.dataset.answer === s.answer) o.classList.add("correct");
        else if (o === b) o.classList.add("wrong");
      });
      q.verdict.textContent = ok ? "✅ Spot on!" : `❌ It's ${LABEL[s.answer].toLowerCase()}`;
      q.why.textContent = s.why;
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
    const usCount = SCENARIOS.filter((s) => s.answer !== "provider").length;
    const pct = right / SCENARIOS.length;
    document.getElementById("qd-emoji").textContent = pct === 1 ? "🏆" : pct >= 0.6 ? "🎉" : "🤔";
    document.getElementById("qd-title").textContent = `${right} out of ${SCENARIOS.length}`;
    document.getElementById("qd-text").textContent =
      `In ${usCount} of the ${SCENARIOS.length} scenarios, we were on the hook. The provider was solely to blame only twice.`;
  });

  document.getElementById("q-restart").addEventListener("click", () => {
    qi = 0; right = 0; answered = 0;
    renderQuestion();
  });
  renderQuestion();

  /* ---------- Slide 10 · Tick boxes ---------- */
  document.querySelectorAll(".tick").forEach((t) =>
    t.addEventListener("click", () => {
      t.classList.toggle("is-on");
      t.setAttribute("aria-pressed", String(t.classList.contains("is-on")));
    })
  );
})();
