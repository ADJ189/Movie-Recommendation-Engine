// js/app.js — CineMatch v2

(function () {
  "use strict";

  // ── State ─────────────────────────────────────────────────────────────────
  const S = {
    quizIndex: 0, quizAnswers: {},
    ratingPool: [], ratings: {},
    engine: null, fluid: null,
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const $ = sel => document.querySelector(sel);
  const $$ = sel => [...document.querySelectorAll(sel)];

  function showScreen(id) {
    $$(".screen").forEach(s => s.classList.remove("active"));
    const el = document.getElementById(id);
    el.classList.add("active");
    el.scrollTop = 0; window.scrollTo(0, 0);
    // Update fluid color mode per screen
    if (S.fluid) {
      const modes = { "screen-landing": "cinema", "screen-quiz": "gold", "screen-rating": "purple", "screen-results": "cinema" };
      S.fluid.setColorMode(modes[id] || "cinema");
    }
  }

  // ── Fluid Background ──────────────────────────────────────────────────────
  function initFluid() {
    const canvas = document.getElementById("fluid-canvas");
    function resize() {
      canvas.width  = Math.min(window.innerWidth, 600);
      canvas.height = Math.min(window.innerHeight, 600);
    }
    resize();
    window.addEventListener("resize", resize);
    S.fluid = new FluidSim(canvas, {
      resolution: 96,
      viscosity: 0.003,
      diffusion: 0.000008,
      iterations: 12,
      colorMode: "cinema",
      interactive: true,
      autoSwirl: true,
    });
  }

  // ── Landing ────────────────────────────────────────────────────────────────
  $("#btn-start").addEventListener("click", () => {
    showScreen("screen-quiz");
    renderQuestion(0);
  });

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  function renderQuestion(idx) {
    const q = QUIZ_QUESTIONS[idx];
    const total = QUIZ_QUESTIONS.length;
    $("#quiz-progress").style.width = (idx / total * 100) + "%";
    $("#quiz-label").textContent = `${idx + 1} / ${total}`;

    const body = $("#quiz-body");
    body.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "quiz-card animate-in";
    wrap.innerHTML = `
      <div class="q-emoji">${q.emoji}</div>
      <h2 class="q-text">${q.question}</h2>
      <div class="options-grid ${q.options.length <= 3 ? "cols-3" : "cols-2"}">
        ${q.options.map(opt => `
          <button class="opt-btn" data-value="${opt.value}">
            <span class="opt-icon">${opt.icon}</span>
            <span class="opt-label">${opt.label}</span>
          </button>`).join("")}
      </div>
    `;
    body.appendChild(wrap);

    wrap.querySelectorAll(".opt-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        wrap.querySelectorAll(".opt-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        // Fluid burst on selection
        if (S.fluid) {
          const x = Math.random() * 0.6 + 0.2, y = Math.random() * 0.6 + 0.2;
          for (let i = 0; i < 5; i++) {
            S.fluid.addForce(
              x + (Math.random()-.5)*.15, y + (Math.random()-.5)*.15,
              (Math.random()-.5)*400, (Math.random()-.5)*400,
              0.9, 0.65, 0.1
            );
          }
        }
        setTimeout(() => {
          S.quizAnswers[q.id] = btn.dataset.value;
          if (idx + 1 < QUIZ_QUESTIONS.length) {
            renderQuestion(idx + 1);
          } else {
            showScreen("screen-rating");
            prepareRatingPool();
          }
        }, 280);
      });
    });
  }

  // ── RATING ─────────────────────────────────────────────────────────────────
  function prepareRatingPool() {
    S.ratingPool = [...RATING_POOL].sort(() => Math.random() - 0.5).slice(0, 6);
    S.ratings = {};
    $("#rating-intro").classList.remove("hidden");
    $("#rating-body").classList.add("hidden");
    // Pre-fetch poster images
    S.ratingPool.forEach(item => {
      fetchTMDBPoster(item.tmdbId, item.tmdbType, null);
    });
  }

  $("#btn-start-rating").addEventListener("click", () => {
    $("#rating-intro").classList.add("hidden");
    $("#rating-body").classList.remove("hidden");
    renderRatingCard(0);
  });

  async function renderRatingCard(idx) {
    const pool = S.ratingPool;
    const total = pool.length;
    $("#rating-progress").style.width = (idx / total * 100) + "%";
    $("#rating-label").textContent = idx < total ? `${idx + 1} / ${total}` : "Done!";

    const body = $("#rating-body");
    body.innerHTML = "";

    if (idx >= total) { computeAndShowResults(); return; }

    const item = pool[idx];
    const posterUrl = await fetchTMDBPoster(item.tmdbId, item.tmdbType, null);

    const card = document.createElement("div");
    card.className = "rating-card animate-in";
    card.innerHTML = `
      <button class="btn-not-seen" id="btn-not-seen">Haven't seen it →</button>
      <div class="rating-poster-wrap">
        ${posterUrl
          ? `<img class="rating-poster-img" src="${posterUrl}" alt="${item.title}" loading="lazy">`
          : `<div class="rating-poster-fallback">${item.emoji}</div>`
        }
      </div>
      <h2 class="rating-title-text">${item.title}</h2>
      <p class="rating-year">${item.year}</p>
      <p class="rating-prompt">How would you rate it?</p>
      <div class="stars-row" id="stars-row">
        ${[1,2,3,4,5].map(n =>
          `<button class="star-btn" data-val="${n}" aria-label="${n} stars">★</button>`
        ).join("")}
      </div>
      <p class="star-label" id="star-label">Tap a star to rate</p>
    `;
    body.appendChild(card);

    const stars = card.querySelectorAll(".star-btn");
    stars.forEach(s => {
      s.addEventListener("mouseover", () => litStars(stars, +s.dataset.val));
      s.addEventListener("mouseout",  () => litStars(stars, S.ratings[item.id] || 0));
      s.addEventListener("click", () => {
        const val = +s.dataset.val;
        S.ratings[item.id] = val;
        litStars(stars, val);
        card.querySelector("#star-label").textContent = STAR_LABELS[val];
        // Fluid effect on rating
        if (S.fluid) {
          const cols = [[0.9,0.1,0.1],[0.9,0.5,0.1],[0.9,0.8,0.1],[0.4,0.9,0.2],[0.1,0.9,0.5]];
          const [r,g,b] = cols[val-1];
          for (let i = 0; i < 8; i++) {
            S.fluid.addForce(
              0.3+Math.random()*0.4, 0.3+Math.random()*0.4,
              (Math.random()-.5)*500, (Math.random()-.5)*500,
              r, g, b
            );
          }
        }
        setTimeout(() => renderRatingCard(idx + 1), 450);
      });
    });
    card.querySelector("#btn-not-seen").addEventListener("click", () => renderRatingCard(idx + 1));
  }

  const STAR_LABELS = ["","Didn't like it","It was okay","Liked it","Really liked it","Loved it! ✨"];
  function litStars(stars, n) {
    stars.forEach(s => s.classList.toggle("lit", +s.dataset.val <= n));
  }

  // ── RESULTS ────────────────────────────────────────────────────────────────
  async function computeAndShowResults() {
    showScreen("screen-results");
    $("#results-loading").classList.remove("hidden");
    $("#results-content").classList.add("hidden");

    S.engine = new RecommendationEngine();
    S.engine.processQuiz(S.quizAnswers);
    S.engine.processRatings(S.ratings);
    const results = S.engine.getResults();
    const top = results[0];
    const rest = results.slice(1, 5);
    const reasons = S.engine.getReasons(top);

    // Fetch top poster + backdrop in parallel
    const [posterUrl, backdropUrl] = await Promise.all([
      fetchTMDBPoster(top.tmdbId, top.tmdbType, top.posterPath),
      fetchTMDBPoster(top.tmdbId, top.tmdbType, top.backdropPath)
    ]);

    // Also pre-fetch runner-ups (non-blocking)
    rest.forEach(item => fetchTMDBPoster(item.tmdbId, item.tmdbType, item.posterPath));

    // Populate DOM
    $("#res-title").textContent = top.title;
    $("#res-meta").innerHTML = `
      <span class="meta-pill">${top.type === "movie" ? "🎬 Movie" : "📺 Series"}</span>
      <span class="meta-pill">📅 ${top.year}</span>
      <span class="meta-pill">⭐ ${top.rating}</span>
      ${top.tags.map(t => `<span class="meta-pill tag">${t}</span>`).join("")}
    `;

    // Backdrop blurred hero
    if (top.backdropPath) {
      const bdUrl = tmdbImg(top.backdropPath, "backdrop");
      $("#res-backdrop").style.backgroundImage = `url(${bdUrl})`;
    } else {
      $("#res-backdrop").style.background = `linear-gradient(135deg, ${top.accentColor}, ${top.accentLight || "#333"})`;
    }

    // Poster
    const posterEl = $("#res-poster");
    if (posterUrl) {
      posterEl.innerHTML = `<img src="${posterUrl}" alt="${top.title}" class="poster-img">`;
    } else {
      posterEl.style.background = top.accentColor;
      posterEl.innerHTML = `<span class="poster-emoji-lg">${top.poster || "🎬"}</span>`;
    }

    $("#res-desc").textContent = top.desc;

    // Animated score bar
    setTimeout(() => {
      $("#res-score-bar").style.width = top.matchPct + "%";
      animateNum($("#res-score-pct"), 0, top.matchPct, 900, v => $("#res-score-pct").textContent = v + "%");
    }, 400);

    // Reasons
    if (reasons.length) {
      $("#res-why").innerHTML = `
        <p class="why-title">Why this pick?</p>
        <ul class="why-list">
          ${reasons.map(r => `<li><span class="why-check">✓</span>${r}</li>`).join("")}
        </ul>
      `;
    }

    // Attribution (TMDB)
    $("#tmdb-attr").innerHTML = `<span>Movie data &amp; images provided by</span>
      <a href="https://www.themoviedb.org" target="_blank" rel="noopener">
        <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb20f682cfcde4f289e2a97a87b5f7cc2.svg" alt="TMDB" class="tmdb-logo">
      </a>`;

    // Runner-ups
    renderRunnerUps(rest);

    $("#results-loading").classList.add("hidden");
    $("#results-content").classList.remove("hidden");

    // Fluid burst on reveal
    if (S.fluid) {
      for (let i = 0; i < 20; i++) {
        S.fluid.addForce(
          Math.random(), Math.random(),
          (Math.random()-.5)*800, (Math.random()-.5)*800,
          0.9, 0.6+Math.random()*0.3, Math.random()*0.3
        );
      }
    }
  }

  async function renderRunnerUps(items) {
    const grid = $("#also-grid");
    grid.innerHTML = "";
    for (const item of items) {
      const posterUrl = await fetchTMDBPoster(item.tmdbId, item.tmdbType, item.posterPath);
      const card = document.createElement("div");
      card.className = "also-card animate-in";
      card.innerHTML = `
        <div class="also-poster-wrap">
          ${posterUrl
            ? `<img src="${posterUrl}" alt="${item.title}" class="also-poster-img" loading="lazy">`
            : `<div class="also-poster-fallback" style="background:${item.accentColor}">${item.poster||"🎬"}</div>`
          }
        </div>
        <div class="also-info">
          <p class="also-title">${item.title}</p>
          <p class="also-meta">${item.year} · ${item.type === "movie" ? "Movie" : "Series"} · ⭐ ${item.rating}</p>
          <div class="also-bar-wrap">
            <div class="also-bar"><div class="also-fill" style="width:${item.matchPct}%"></div></div>
            <span class="also-pct">${item.matchPct}%</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    }
  }

  function animateNum(el, from, to, dur, cb) {
    const start = performance.now();
    const tick = now => {
      const t = Math.min(1, (now-start)/dur);
      const ease = 1 - Math.pow(1-t, 3);
      cb(Math.round(from + (to-from)*ease));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── Restart ────────────────────────────────────────────────────────────────
  function restart() {
    S.quizIndex = 0; S.quizAnswers = {};
    S.ratingPool = []; S.ratings = {}; S.engine = null;
    showScreen("screen-landing");
  }
  $("#btn-restart").addEventListener("click", restart);
  $("#btn-restart2").addEventListener("click", restart);

  // ── Init ───────────────────────────────────────────────────────────────────
  initFluid();

})();
