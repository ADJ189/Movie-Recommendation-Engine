// js/data.js — CineMatch v2 with TMDB integration

// ─── TMDB CONFIG ─────────────────────────────────────────────────────────────
// Users set their free TMDB API key here (https://www.themoviedb.org/settings/api)
// Without a key, the app falls back to beautiful gradient placeholder posters.
const TMDB_CONFIG = {
  API_KEY: "", // ← Paste your free TMDB API key here (v3 auth)
  // OR use a Bearer token (v4):
  ACCESS_TOKEN: "", // ← Paste your TMDB Read Access Token here
  IMAGE_BASE: "https://image.tmdb.org/t/p/",
  SIZES: { thumb: "w342", full: "w500", backdrop: "w780" },
};

// Build poster URL from path
function tmdbImg(path, size = "full") {
  if (!path) return null;
  return `${TMDB_CONFIG.IMAGE_BASE}${TMDB_CONFIG.SIZES[size]}${path}`;
}

// ─── QUIZ QUESTIONS ───────────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    id: "mood",
    question: "What kind of mood are you in?",
    emoji: "🎭",
    type: "single",
    options: [
      { label: "Thrilled & on-edge",  value: "thriller",  icon: "⚡" },
      { label: "Laughing out loud",   value: "comedy",    icon: "😂" },
      { label: "Deeply moved",        value: "drama",     icon: "💔" },
      { label: "Mind blown",          value: "scifi",     icon: "🚀" },
      { label: "Scared & screaming",  value: "horror",    icon: "👻" },
      { label: "Swept into adventure",value: "adventure", icon: "🗺️" },
    ],
  },
  {
    id: "format",
    question: "Movie or series?",
    emoji: "📺",
    type: "single",
    options: [
      { label: "Movie — done in 2 hours",          value: "movie",  icon: "🎬" },
      { label: "Series — I want more episodes",    value: "series", icon: "📺" },
      { label: "Either works for me",              value: "both",   icon: "🤷" },
    ],
  },
  {
    id: "era",
    question: "Any era preference?",
    emoji: "📅",
    type: "single",
    options: [
      { label: "Classic (pre-2000)",  value: "classic", icon: "🎞️" },
      { label: "2000s–2015",          value: "mid",     icon: "📼" },
      { label: "Recent (2016–now)",   value: "recent",  icon: "✨" },
      { label: "No preference",       value: "any",     icon: "🌀" },
    ],
  },
  {
    id: "vibe",
    question: "Pick your vibe:",
    emoji: "✨",
    type: "single",
    options: [
      { label: "Dark & gritty",       value: "dark",         icon: "🌑" },
      { label: "Light & fun",         value: "light",        icon: "☀️" },
      { label: "Thought-provoking",   value: "intellectual", icon: "🧠" },
      { label: "Feel-good & warm",    value: "feelgood",     icon: "🌈" },
      { label: "Epic & grand",        value: "epic",         icon: "🏔️" },
    ],
  },
  {
    id: "company",
    question: "Who are you watching with?",
    emoji: "👥",
    type: "single",
    options: [
      { label: "Solo — just me",      value: "solo",    icon: "🙋" },
      { label: "Partner / date night",value: "date",    icon: "💑" },
      { label: "Friends group",       value: "friends", icon: "🎉" },
      { label: "Family with kids",    value: "family",  icon: "👨‍👩‍👧" },
    ],
  },
  {
    id: "language",
    question: "Language preference?",
    emoji: "🌍",
    type: "single",
    options: [
      { label: "English only",        value: "english",  icon: "🇬🇧" },
      { label: "Fine with subtitles", value: "subtitles",icon: "💬" },
      { label: "No preference",       value: "any_lang", icon: "🌐" },
    ],
  },
];

// ─── MAIN CATALOG ─────────────────────────────────────────────────────────────
// tmdbId: TMDB movie/TV id
// tmdbType: "movie" or "tv"
// posterPath: pre-fetched path from TMDB (fallback when no API key)
// backdropPath: backdrop image path
// accentColor: dominant color for gradient fallback poster

const CATALOG = [
  {
    id: 1, title: "Parasite", year: 2019, type: "movie",
    tmdbId: 496243, tmdbType: "movie",
    posterPath: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdropPath: "/ApiBzeaa95TNYLSn3EivCwSUXAT.jpg",
    accentColor: "#1a0a2e", accentLight: "#7c3aed",
    genres: ["thriller","drama"], vibe: ["dark","intellectual"],
    language: "korean", era: "recent",
    company: ["solo","date","friends"],
    rating: 8.5,
    desc: "A poor family schemes to become employed by a wealthy household — a razor-sharp social satire.",
    tags: ["Oscar winner","Bong Joon-ho","Class warfare"],
  },
  {
    id: 2, title: "Gone Girl", year: 2014, type: "movie",
    tmdbId: 210577, tmdbType: "movie",
    posterPath: "/pPQoWqEPHGDnKNyFcBfT49aFaQb.jpg",
    backdropPath: "/tCOTRbWJTEMZ4sHpW8XbTCDRonf.jpg",
    accentColor: "#0d1b2a", accentLight: "#1e40af",
    genres: ["thriller","drama"], vibe: ["dark","intellectual"],
    language: "english", era: "recent",
    company: ["solo","date"],
    rating: 8.1,
    desc: "On their fifth anniversary, Nick Dunne's wife Amy vanishes — a twisting psychological thriller.",
    tags: ["David Fincher","Psychological","Twist ending"],
  },
  {
    id: 3, title: "Inception", year: 2010, type: "movie",
    tmdbId: 27205, tmdbType: "movie",
    posterPath: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdropPath: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    accentColor: "#0a1628", accentLight: "#2563eb",
    genres: ["thriller","scifi"], vibe: ["intellectual","epic"],
    language: "english", era: "mid",
    company: ["solo","date","friends"],
    rating: 8.8,
    desc: "A thief who steals corporate secrets via dream-sharing is given the task of planting an idea.",
    tags: ["Christopher Nolan","Mind-bending","Hans Zimmer"],
  },
  {
    id: 4, title: "Mindhunter", year: 2017, type: "series",
    tmdbId: 67744, tmdbType: "tv",
    posterPath: "/nV8lKFUFqLRdoOk3N0jqkSFYgAH.jpg",
    backdropPath: "/z4WMmEE5OCNBV2IqGiQAriSuKoE.jpg",
    accentColor: "#111111", accentLight: "#475569",
    genres: ["thriller","drama"], vibe: ["dark","intellectual"],
    language: "english", era: "recent",
    company: ["solo","date"],
    rating: 8.6,
    desc: "FBI agents interview serial killers to develop criminal profiling techniques.",
    tags: ["David Fincher","True crime","Serial killers"],
  },
  {
    id: 5, title: "Oldboy", year: 2003, type: "movie",
    tmdbId: 670, tmdbType: "movie",
    posterPath: "/pWDtjs568ZfOTMbURQBYuT4Qxka.jpg",
    backdropPath: "/5jHjEbCkK4BO0TzVLUnEFq8GvUj.jpg",
    accentColor: "#1c0a0a", accentLight: "#991b1b",
    genres: ["thriller","drama"], vibe: ["dark"],
    language: "korean", era: "classic",
    company: ["solo"],
    rating: 8.4,
    desc: "After being imprisoned for 15 years with no explanation, a man is suddenly released and seeks revenge.",
    tags: ["Park Chan-wook","Shocking","Cult classic"],
  },
  {
    id: 6, title: "Interstellar", year: 2014, type: "movie",
    tmdbId: 157336, tmdbType: "movie",
    posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdropPath: "/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
    accentColor: "#080820", accentLight: "#4338ca",
    genres: ["scifi","adventure"], vibe: ["epic","intellectual"],
    language: "english", era: "recent",
    company: ["solo","date","friends"],
    rating: 8.7,
    desc: "Explorers travel through a wormhole in space to ensure humanity's survival.",
    tags: ["Christopher Nolan","Space","Hans Zimmer"],
  },
  {
    id: 7, title: "Arrival", year: 2016, type: "movie",
    tmdbId: 329865, tmdbType: "movie",
    posterPath: "/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
    backdropPath: "/eFxcRNwnNKFVQCHJ7RQALG1z4GV.jpg",
    accentColor: "#0e1a14", accentLight: "#166534",
    genres: ["scifi","drama"], vibe: ["intellectual","dark"],
    language: "english", era: "recent",
    company: ["solo","date"],
    rating: 8.0,
    desc: "When alien spacecraft appear worldwide, a linguist works to communicate with the mysterious visitors.",
    tags: ["Denis Villeneuve","Linguistics","Emotional"],
  },
  {
    id: 8, title: "Black Mirror", year: 2011, type: "series",
    tmdbId: 42009, tmdbType: "tv",
    posterPath: "/7PRddO7z7MCPKt7oPnNwp38RUDB.jpg",
    backdropPath: "/f9ZFoTHpDsYcnHpxp8NiMcTjkJa.jpg",
    accentColor: "#0d0d0d", accentLight: "#27272a",
    genres: ["scifi","thriller"], vibe: ["dark","intellectual"],
    language: "english", era: "recent",
    company: ["solo","date"],
    rating: 8.8,
    desc: "An anthology series where humanity's greatest tech innovations collide with its darkest instincts.",
    tags: ["Anthology","Technology","Charlie Brooker"],
  },
  {
    id: 9, title: "Dune: Part Two", year: 2024, type: "movie",
    tmdbId: 693134, tmdbType: "movie",
    posterPath: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    backdropPath: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    accentColor: "#1a1000", accentLight: "#b45309",
    genres: ["scifi","adventure"], vibe: ["epic","intellectual"],
    language: "english", era: "recent",
    company: ["solo","date","friends"],
    rating: 8.6,
    desc: "Paul Atreides unites with the Fremen while seeking revenge against the conspirators who destroyed his family.",
    tags: ["Denis Villeneuve","Visually stunning","Epic scale"],
  },
  {
    id: 10, title: "Severance", year: 2022, type: "series",
    tmdbId: 95396, tmdbType: "tv",
    posterPath: "/pqzjCxPVc9TkVgGRWeAoMmyqkZV.jpg",
    backdropPath: "/fkIGXNnhk3pKMFRaxvNFIYDHxzV.jpg",
    accentColor: "#101520", accentLight: "#1d4ed8",
    genres: ["scifi","thriller"], vibe: ["dark","intellectual"],
    language: "english", era: "recent",
    company: ["solo","date"],
    rating: 8.7,
    desc: "Workers whose memories are surgically divided between their work and personal lives uncover a shocking truth.",
    tags: ["Apple TV+","Office horror","Mind-bending"],
  },
  {
    id: 11, title: "The Grand Budapest Hotel", year: 2014, type: "movie",
    tmdbId: 120467, tmdbType: "movie",
    posterPath: "/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
    backdropPath: "/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg",
    accentColor: "#3d0e1e", accentLight: "#be185d",
    genres: ["comedy","adventure"], vibe: ["light","epic"],
    language: "english", era: "recent",
    company: ["solo","date","friends"],
    rating: 8.1,
    desc: "A writer encounters the owner of an aging European hotel and learns of his early life between the wars.",
    tags: ["Wes Anderson","Quirky","Colour palette"],
  },
  {
    id: 12, title: "What We Do in the Shadows", year: 2019, type: "series",
    tmdbId: 83121, tmdbType: "tv",
    posterPath: "/8LGh6COhoeIFGJoEnFpfxkuF8qF.jpg",
    backdropPath: "/9DEpZRmxcGMXuGJwRjYFqCIfDbs.jpg",
    accentColor: "#1a0028", accentLight: "#7c3aed",
    genres: ["comedy","horror"], vibe: ["light","dark"],
    language: "english", era: "recent",
    company: ["solo","friends"],
    rating: 8.6,
    desc: "A documentary crew follows vampire roommates navigating modern life in Staten Island.",
    tags: ["Mockumentary","Jemaine Clement","Absurdist"],
  },
  {
    id: 13, title: "The Office (US)", year: 2005, type: "series",
    tmdbId: 2316, tmdbType: "tv",
    posterPath: "/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg",
    backdropPath: "/wFNaMVFHqxijfZpgd8b8L6DL1q1.jpg",
    accentColor: "#1c2a1c", accentLight: "#166534",
    genres: ["comedy"], vibe: ["light","feelgood"],
    language: "english", era: "mid",
    company: ["solo","friends","date"],
    rating: 9.0,
    desc: "A mockumentary on office workers where the workday consists of ego clashes and inappropriate jokes.",
    tags: ["Comfort watch","Steve Carell","Mockumentary"],
  },
  {
    id: 14, title: "Knives Out", year: 2019, type: "movie",
    tmdbId: 546554, tmdbType: "movie",
    posterPath: "/pThyQovXQrws2hmkal2gSoAfsFQ.jpg",
    backdropPath: "/wfYv7GAN7NLUBiHiVoTEUGGBypo.jpg",
    accentColor: "#1a0f00", accentLight: "#92400e",
    genres: ["comedy","thriller"], vibe: ["light","intellectual"],
    language: "english", era: "recent",
    company: ["solo","friends","date","family"],
    rating: 8.0,
    desc: "A detective investigates the death of a patriarch of an eccentric, combative family.",
    tags: ["Whodunit","Daniel Craig","Ensemble cast"],
  },
  {
    id: 15, title: "Abbott Elementary", year: 2021, type: "series",
    tmdbId: 110492, tmdbType: "tv",
    posterPath: "/9yjazgNkYbGHJuvzXaSBaWZzxrc.jpg",
    backdropPath: "/qcNDL5R9N5DePFkFOaeFw2JJJMF.jpg",
    accentColor: "#0d2200", accentLight: "#15803d",
    genres: ["comedy"], vibe: ["light","feelgood"],
    language: "english", era: "recent",
    company: ["solo","friends","family"],
    rating: 8.2,
    desc: "Dedicated teachers and an oblivious principal work in an underfunded Philadelphia public school.",
    tags: ["Heartwarming","Mockumentary","Emmy winner"],
  },
  {
    id: 16, title: "Breaking Bad", year: 2008, type: "series",
    tmdbId: 1396, tmdbType: "tv",
    posterPath: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    backdropPath: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    accentColor: "#1a1200", accentLight: "#854d0e",
    genres: ["drama","thriller"], vibe: ["dark"],
    language: "english", era: "mid",
    company: ["solo","date"],
    rating: 9.5,
    desc: "A chemistry teacher diagnosed with cancer turns to manufacturing drugs to secure his family's future.",
    tags: ["Vince Gilligan","Greatest TV","Character study"],
  },
  {
    id: 17, title: "Succession", year: 2018, type: "series",
    tmdbId: 76331, tmdbType: "tv",
    posterPath: "/e2X8xQZDTjGLCBOD3j6JHfGPW3V.jpg",
    backdropPath: "/2k3KPFIJ9fZnBpTiHSnR0nJ8tkJ.jpg",
    accentColor: "#0a0a14", accentLight: "#1e3a5f",
    genres: ["drama","comedy"], vibe: ["dark","intellectual"],
    language: "english", era: "recent",
    company: ["solo","date"],
    rating: 8.9,
    desc: "The Roy family controls a media empire, but the future of the business — and their relationships — is uncertain.",
    tags: ["Power dynamics","Dialogue","Emmy winner"],
  },
  {
    id: 18, title: "The Shawshank Redemption", year: 1994, type: "movie",
    tmdbId: 278, tmdbType: "movie",
    posterPath: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    backdropPath: "/kXfqcdQKsToO0OUXHcrrNCHDBnm.jpg",
    accentColor: "#0d1a0d", accentLight: "#166534",
    genres: ["drama"], vibe: ["feelgood","dark"],
    language: "english", era: "classic",
    company: ["solo","date","friends"],
    rating: 9.3,
    desc: "Two imprisoned men bond over years, finding solace and redemption through acts of common decency.",
    tags: ["IMDB #1","Stephen King","Hope"],
  },
  {
    id: 19, title: "Normal People", year: 2020, type: "series",
    tmdbId: 90462, tmdbType: "tv",
    posterPath: "/pQGHMF0cxnGtFkuZBRhUNdNRuZ1.jpg",
    backdropPath: "/oQ78MHJP3GBTp1JXbNlHbHKJAyb.jpg",
    accentColor: "#1c0a10", accentLight: "#9d174d",
    genres: ["drama"], vibe: ["feelgood","dark"],
    language: "english", era: "recent",
    company: ["solo","date"],
    rating: 8.0,
    desc: "The complex, on-and-off relationship of Connell and Marianne through their college years in Ireland.",
    tags: ["Sally Rooney","Romance","Emotional"],
  },
  {
    id: 20, title: "Shōgun", year: 2024, type: "series",
    tmdbId: 126308, tmdbType: "tv",
    posterPath: "/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg",
    backdropPath: "/aTfgB5uyHOHhBg01jgcMsGnFV5A.jpg",
    accentColor: "#1a0a00", accentLight: "#92400e",
    genres: ["drama","adventure"], vibe: ["epic","dark"],
    language: "subtitles", era: "recent",
    company: ["solo","date","friends"],
    rating: 8.9,
    desc: "A shipwrecked English navigator becomes a key player in feudal Japanese politics.",
    tags: ["Emmy winner","Epic","Historical"],
  },
  {
    id: 21, title: "Hereditary", year: 2018, type: "movie",
    tmdbId: 493922, tmdbType: "movie",
    posterPath: "/4QZDEJiOrETRLqkFoTVqFe6xlW7.jpg",
    backdropPath: "/pCMkHDEVJcj4Z5FlzJLZZkMNF6y.jpg",
    accentColor: "#120000", accentLight: "#7f1d1d",
    genres: ["horror","thriller"], vibe: ["dark"],
    language: "english", era: "recent",
    company: ["solo","date","friends"],
    rating: 7.8,
    desc: "A grieving family is haunted by tragic and disturbing occurrences after their secretive grandmother dies.",
    tags: ["Ari Aster","A24","Slow burn"],
  },
  {
    id: 22, title: "The Haunting of Hill House", year: 2018, type: "series",
    tmdbId: 72928, tmdbType: "tv",
    posterPath: "/9VmAMx1b1fJMCvdvBkCOhsG5PUW.jpg",
    backdropPath: "/gp5YKCVmLyBKaEGlhv9u3nFYQXN.jpg",
    accentColor: "#0a0014", accentLight: "#4c1d95",
    genres: ["horror","drama"], vibe: ["dark"],
    language: "english", era: "recent",
    company: ["solo","date"],
    rating: 8.6,
    desc: "Flashing between past and present, a fractured family confronts haunting memories of their old home.",
    tags: ["Mike Flanagan","Family drama","Atmosphere"],
  },
  {
    id: 23, title: "Get Out", year: 2017, type: "movie",
    tmdbId: 419430, tmdbType: "movie",
    posterPath: "/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg",
    backdropPath: "/sOHqdY1RnSn6kcfAHKu28jvTebE.jpg",
    accentColor: "#0d0d0d", accentLight: "#374151",
    genres: ["horror","thriller"], vibe: ["dark","intellectual"],
    language: "english", era: "recent",
    company: ["solo","date","friends"],
    rating: 7.7,
    desc: "A young Black man visits his white girlfriend's parents for the weekend, where his uneasiness grows.",
    tags: ["Jordan Peele","Social commentary","Oscar winner"],
  },
  {
    id: 24, title: "Mad Max: Fury Road", year: 2015, type: "movie",
    tmdbId: 76341, tmdbType: "movie",
    posterPath: "/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg",
    backdropPath: "/phszHPFzBKWBMGbVpMNFXvPHvOT.jpg",
    accentColor: "#1a0800", accentLight: "#c2410c",
    genres: ["adventure","thriller"], vibe: ["epic","dark"],
    language: "english", era: "recent",
    company: ["solo","friends"],
    rating: 8.1,
    desc: "In a post-apocalyptic wasteland, Max and Furiosa flee a cult leader in a relentless, chrome-drenched chase.",
    tags: ["George Miller","Practical effects","Relentless"],
  },
  {
    id: 25, title: "Everything Everywhere All at Once", year: 2022, type: "movie",
    tmdbId: 545611, tmdbType: "movie",
    posterPath: "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    backdropPath: "/fP0lGY4BYkjcbxlnMXhLNhk5MbQ.jpg",
    accentColor: "#0d001a", accentLight: "#6d28d9",
    genres: ["adventure","comedy","scifi"], vibe: ["intellectual","feelgood","light"],
    language: "english", era: "recent",
    company: ["solo","date","friends"],
    rating: 8.0,
    desc: "A laundromat owner must connect with parallel universe versions of herself to prevent destruction of everything.",
    tags: ["A24","Oscar winner","Multiverse"],
  },
  {
    id: 26, title: "Andor", year: 2022, type: "series",
    tmdbId: 83867, tmdbType: "tv",
    posterPath: "/59SVNwLfoMnZPPB6ukW6dlPxAdI.jpg",
    backdropPath: "/7Nkb5bKyCQHBlEWpjBvsKmgTe50.jpg",
    accentColor: "#050a14", accentLight: "#1e3a5f",
    genres: ["adventure","scifi","drama"], vibe: ["dark","epic"],
    language: "english", era: "recent",
    company: ["solo","date","friends"],
    rating: 8.5,
    desc: "The formative years of Rebel spy Cassian Andor during the Dark Times of the Galactic Empire.",
    tags: ["Star Wars","Grounded","Political thriller"],
  },
  {
    id: 27, title: "Ted Lasso", year: 2020, type: "series",
    tmdbId: 97546, tmdbType: "tv",
    posterPath: "/5fhZdwP1DVJ0FyVH6vrFdHwpXIn.jpg",
    backdropPath: "/mFbtyFRE2GWiUAI8EFbzVKXSP9p.jpg",
    accentColor: "#001a0a", accentLight: "#166534",
    genres: ["comedy","drama"], vibe: ["feelgood","light"],
    language: "english", era: "recent",
    company: ["solo","date","friends","family"],
    rating: 8.8,
    desc: "An American football coach is hired to manage an English soccer team despite having no relevant experience.",
    tags: ["Wholesome","AppleTV+","Feel-good"],
  },
  {
    id: 28, title: "Klaus", year: 2019, type: "movie",
    tmdbId: 586040, tmdbType: "movie",
    posterPath: "/b0SyxOD5n2fBLhvBT8lmvOBKjsb.jpg",
    backdropPath: "/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg",
    accentColor: "#00101a", accentLight: "#0e4d82",
    genres: ["adventure","comedy"], vibe: ["feelgood","light"],
    language: "english", era: "recent",
    company: ["solo","family","friends"],
    rating: 8.2,
    desc: "A selfish postal worker and a reclusive toymaker form an unlikely friendship in this reimagined Santa Claus origin.",
    tags: ["Netflix animated","Heartwarming","Beautiful art"],
  },
  {
    id: 29, title: "The Bear", year: 2022, type: "series",
    tmdbId: 136315, tmdbType: "tv",
    posterPath: "/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg",
    backdropPath: "/nNl5gGKFPfPt6HT4V0CXMQ5MNPH.jpg",
    accentColor: "#120800", accentLight: "#92400e",
    genres: ["drama","comedy"], vibe: ["dark","intellectual","feelgood"],
    language: "english", era: "recent",
    company: ["solo","date"],
    rating: 8.8,
    desc: "A fine-dining chef returns to Chicago to run his family's sandwich shop after a death in the family.",
    tags: ["Emmy winner","Intense","Food"],
  },
  {
    id: 30, title: "Hana-Bi", year: 1997, type: "movie",
    tmdbId: 10909, tmdbType: "movie",
    posterPath: "/eqJhKTXxmgjPRByLhL0W1XLzWCc.jpg",
    backdropPath: "/rRvZO4EGn8iV7wAzW5FQAQE0iYl.jpg",
    accentColor: "#0a0a1a", accentLight: "#1e3a5f",
    genres: ["drama","thriller"], vibe: ["dark","intellectual"],
    language: "japanese", era: "classic",
    company: ["solo"],
    rating: 8.0,
    desc: "A detective caring for his terminally ill wife turns to violent crime to cover debts in this art house masterpiece.",
    tags: ["Kitano Takeshi","Art house","Venice winner"],
  },
];

// ─── RATING POOL (calibration titles) ────────────────────────────────────────
const RATING_POOL = [
  { id: 101, title: "The Dark Knight",          emoji: "🦇", year: 2008, tmdbId: 155,    tmdbType: "movie" },
  { id: 102, title: "Pulp Fiction",             emoji: "🗃️", year: 1994, tmdbId: 680,    tmdbType: "movie" },
  { id: 103, title: "Avengers: Endgame",        emoji: "🛡️", year: 2019, tmdbId: 299534, tmdbType: "movie" },
  { id: 104, title: "Stranger Things",          emoji: "🔦", year: 2016, tmdbId: 66732,  tmdbType: "tv" },
  { id: 105, title: "Game of Thrones",          emoji: "🐉", year: 2011, tmdbId: 1399,   tmdbType: "tv" },
  { id: 106, title: "The Matrix",               emoji: "💊", year: 1999, tmdbId: 603,    tmdbType: "movie" },
  { id: 107, title: "Squid Game",               emoji: "🟩", year: 2021, tmdbId: 93405,  tmdbType: "tv" },
  { id: 108, title: "La La Land",               emoji: "🎷", year: 2016, tmdbId: 313369, tmdbType: "movie" },
  { id: 109, title: "The Silence of the Lambs", emoji: "🦋", year: 1991, tmdbId: 274,    tmdbType: "movie" },
  { id: 110, title: "Friends",                  emoji: "☕", year: 1994, tmdbId: 1668,   tmdbType: "tv" },
  { id: 111, title: "Titanic",                  emoji: "🚢", year: 1997, tmdbId: 597,    tmdbType: "movie" },
  { id: 112, title: "The Lord of the Rings",    emoji: "💍", year: 2001, tmdbId: 120,    tmdbType: "movie" },
  { id: 113, title: "Schindler's List",         emoji: "📋", year: 1993, tmdbId: 424,    tmdbType: "movie" },
  { id: 114, title: "Forrest Gump",             emoji: "🏃", year: 1994, tmdbId: 13,     tmdbType: "movie" },
  { id: 115, title: "The Sopranos",             emoji: "🎻", year: 1999, tmdbId: 1398,   tmdbType: "tv" },
];

// Rating → genre affinity signals
const TITLE_GENRE_MAP = {
  101: ["thriller","dark","epic"],
  102: ["thriller","dark","intellectual"],
  103: ["adventure","epic","feelgood"],
  104: ["scifi","thriller","dark"],
  105: ["drama","adventure","dark","epic"],
  106: ["scifi","thriller","intellectual"],
  107: ["thriller","dark"],
  108: ["drama","comedy","feelgood","light"],
  109: ["thriller","dark","intellectual"],
  110: ["comedy","feelgood","light"],
  111: ["drama","feelgood"],
  112: ["adventure","epic","feelgood"],
  113: ["drama","dark","intellectual"],
  114: ["drama","feelgood","light"],
  115: ["drama","thriller","dark"],
};

// ─── TMDB Image Fetcher ───────────────────────────────────────────────────────
const TMDB_POSTER_CACHE = {};

async function fetchTMDBPoster(tmdbId, tmdbType, fallbackPath) {
  if (TMDB_POSTER_CACHE[tmdbId]) return TMDB_POSTER_CACHE[tmdbId];

  // If no API key, just build URL from baked-in posterPath
  const hasKey = TMDB_CONFIG.API_KEY || TMDB_CONFIG.ACCESS_TOKEN;
  if (!hasKey) {
    const url = fallbackPath ? tmdbImg(fallbackPath, "full") : null;
    TMDB_POSTER_CACHE[tmdbId] = url;
    return url;
  }

  try {
    const endpoint = tmdbType === "tv"
      ? `https://api.themoviedb.org/3/tv/${tmdbId}`
      : `https://api.themoviedb.org/3/movie/${tmdbId}`;

    const headers = TMDB_CONFIG.ACCESS_TOKEN
      ? { Authorization: `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}` }
      : {};
    const sep = endpoint.includes("?") ? "&" : "?";
    const url = TMDB_CONFIG.API_KEY
      ? `${endpoint}${sep}api_key=${TMDB_CONFIG.API_KEY}`
      : endpoint;

    const res = await fetch(url, { headers });
    const data = await res.json();
    const path = data.poster_path || fallbackPath;
    const imgUrl = path ? tmdbImg(path, "full") : null;
    TMDB_POSTER_CACHE[tmdbId] = imgUrl;
    return imgUrl;
  } catch {
    const url = fallbackPath ? tmdbImg(fallbackPath, "full") : null;
    TMDB_POSTER_CACHE[tmdbId] = url;
    return url;
  }
}
