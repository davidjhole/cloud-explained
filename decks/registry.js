/* Deck registry: the single list of decks shown on the home page and used for playlists.
   Only list decks that exist. Add an entry when a new deck folder is merged.
   Ideas for future decks live in the backlog in CLAUDE.md, not here. */
window.CE_DECKS = [
  {
    id: "shared-responsibility",
    title: "Who's Holding the Keys?",
    subtitle: "The Cloud Shared Responsibility Model",
    blurb: "What the cloud provider looks after, what stays with us, and why the line moves between IaaS, PaaS and SaaS.",
    path: "decks/shared-responsibility/",
    icon: "🔑",
    minutes: 15,
    slides: 12,
    tags: ["Security", "Governance"],
  },
  {
    id: "ha-vs-dr",
    title: "Staying Up, or Getting Back Up?",
    subtitle: "High Availability vs Disaster Recovery (RTO & RPO)",
    blurb: "Why surviving a broken server and surviving a disaster are different problems, and the two numbers that decide what each costs.",
    path: "decks/ha-vs-dr/",
    icon: "🛟",
    minutes: 20,
    slides: 13,
    tags: ["Resilience", "Risk"],
  },
];
