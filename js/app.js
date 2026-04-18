// js/app.js — CineMatch App Controller

(function () {
  "use strict";

  // ── State ─────────────────────────────────────────────
  const state = {
    quizIndex: 0,
    quizAnswers: {},
    ratingPool: [],
    ratingIndex: 0,
    ratings: {},
    engine: null,
  };

  // ── Utils ─────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const show = (id) => {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    const el = document.getElementById(id);
    el.classList.add("active");
    el.scrollTop = 0;
    window.scrollTo(0, 0);
  };

  // ── Landing ───────────────────────────────────────────
  $("#btn-start").addEventListener("click", () => {
    show("screen-quiz");
    renderQuestion(0);
  });

  // ── QUIZ ──────────────────────────────────────────────
  function renderQuestion(idx) {
    const q = QUIZ_QUESTIONS[idx];
    const total = QUIZ_QUESTIONS.length;
    const pct = ((idx) / total) * 100;

    $("#quiz-progress").style.width = pct + "%";
    $("#quiz-label").textContent = `${idx + 1} / ${total}`;

    const body = $("#quiz-body");
    body.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "quiz-card animate-in";
    wrap.innerHTML = `
      <div class="q-emoji">${q.emoji}</div>
      <h2 class="q-text">${q.question}</h2>
      <div class="options-grid ${q.options.length <= 3 ? "cols-3" : "cols-2"}">
        ${q.options
          .map(
            (opt) => `
          <button class="opt-btn" data-value="${opt.value}">
            <span class="opt-icon">${opt.icon}</span>
            <span class="opt-label">${opt.label}</span>
          </button>
        `
          )
          .join("")}
      </div>
    `;

    body.appendChild(wrap);

    // Attach listeners
    wrap.querySelectorAll(".opt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        wrap.querySelectorAll(".opt-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");

        setTimeout(() => {
          state.quizAnswers[q.id] = btn.dataset.value;
          const next = idx + 1;
          if (next < QUIZ_QUESTIONS.length) {
            renderQuestion(next);
          } else {
            // Quiz done → go to rating
            show("screen-rating");
            prepareRatingPool();
          }
        }, 280);
      });
    });
  }

  // ── RATING ────────────────────────────────────────────
  function prepareRatingPool() {
    // Pick 6 random titles from RATING_POOL
    const shuffled = [...RATING_POOL].sort(() => Math.random() - 0.5);
    state.ratingPool = shuffled.slice(0, 6);
    state.ratingIndex = 0;

    // Show intro, hide body
    $("#rating-intro").classList.remove("hidden");
    $("#rating-body").classList.add("hidden");
  }

  $("#btn-start-rating").addEventListener("click", () => {
    $("#rating-intro").classList.add("hidden");
    $("#rating-body").classList.remove("hidden");
    renderRatingCard(0);
  });

  function renderRatingCard(idx) {
    const pool = state.ratingPool;
    const total = pool.length;
    const pct = (idx / total) * 100;

    $("#rating-progress").style.width = pct + "%";
    $("#rating-label").textContent = idx < total ? `${idx + 1} / ${total}` : "All done!";

    const body = $("#rating-body");
    body.innerHTML = "";

    if (idx >= total) {
      // All rated → compute results
      computeAndShowResults();
      return;
    }

    const item = pool[idx];
    const existingRating = state.ratings[item.id] || 0;

    const card = document.createElement("div");
    card.className = "rating-card animate-in";
    card.innerHTML = `
      <div class="rating-not-seen">
        <button class="btn-ghost-sm" id="btn-not-seen">Haven't seen it →</button>
      </div>
      <div class="rating-title-emoji">${item.emoji}</div>
      <h2 class="rating-title-text">${item.title}</h2>
      <p class="rating-year">${item.year}</p>
      <p class="rating-prompt">How would you rate it?</p>
      <div class="stars-row" id="stars-row">
        ${[1, 2, 3, 4, 5]
          .map(
            (n) =>
              `<button class="star-btn ${existingRating >= n ? "lit" : ""}" data-val="${n}" aria-label="${n} stars">★</button>`
          )
          .join("")}
      </div>
      <p class="star-label" id="star-label">${existingRating ? ratingLabel(existingRating) : "Tap to rate"}</p>
    `;

    body.appendChild(card);

    // Star interaction
    const stars = card.querySelectorAll(".star-btn");
    stars.forEach((s) => {
      s.addEventListener("mouseover", () => highlightStars(stars, +s.dataset.val));
      s.addEventListener("mouseout", () => highlightStars(stars, state.ratings[item.id] || 0));
      s.addEventListener("click", () => {
        const val = +s.dataset.val;
        state.ratings[item.id] = val;
        highlightStars(stars, val);
        card.querySelector("#star-label").textContent = ratingLabel(val);
        setTimeout(() => renderRatingCard(idx + 1), 400);
      });
    });

    card.querySelector("#btn-not-seen").addEventListener("click", () => {
      renderRatingCard(idx + 1);
    });
  }

  function highlightStars(stars, n) {
    stars.forEach((s) => s.classList.toggle("lit", +s.dataset.val <= n));
  }

  function ratingLabel(n) {
    return ["", "Didn't like it", "It was okay", "Liked it", "Really liked it", "Loved it!"][n] || "";
  }

  // ── RESULTS ───────────────────────────────────────────
  function computeAndShowResults() {
    state.engine = new RecommendationEngine();
    state.engine.processQuiz(state.quizAnswers);
    state.engine.processRatings(state.ratings);
    const results = state.engine.getResults();

    const top = results[0];
    const rest = results.slice(1, 5);
    const reasons = state.engine.getReasons(top);

    // Populate top result
    $("#res-title").textContent = top.title;
    $("#res-meta").innerHTML = `
      <span class="meta-pill">${top.type === "movie" ? "🎬 Movie" : "📺 Series"}</span>
      <span class="meta-pill">${top.year}</span>
      <span class="meta-pill">⭐ ${top.rating}</span>
      ${top.tags.map((t) => `<span class="meta-pill tag">${t}</span>`).join("")}
    `;
    $("#res-poster").style.background = top.posterColor;
    $("#res-poster").innerHTML = `<span class="poster-emoji">${top.poster}</span>`;
    $("#res-desc").textContent = top.desc;

    // Match bar animation
    const scoreBar = $("#res-score-bar");
    const scorePct = $("#res-score-pct");
    setTimeout(() => {
      scoreBar.style.width = top.matchPct + "%";
      animateNumber(scorePct, 0, top.matchPct, 900, (v) => (scorePct.textContent = v + "%"));
    }, 300);

    // Reasons
    if (reasons.length) {
      $("#res-why").innerHTML = `
        <p class="why-title">Why this?</p>
        <ul class="why-list">
          ${reasons.map((r) => `<li>✓ ${r}</li>`).join("")}
        </ul>
      `;
    }

    // Also like grid
    const grid = $("#also-grid");
    grid.innerHTML = rest
      .map(
        (item) => `
      <div class="also-card" style="--poster-bg:${item.posterColor}">
        <div class="also-poster">${item.poster}</div>
        <div class="also-info">
          <p class="also-title">${item.title}</p>
          <p class="also-meta">${item.year} · ${item.type === "movie" ? "Movie" : "Series"}</p>
          <div class="also-match-bar"><div class="also-fill" style="width:${item.matchPct}%"></div></div>
          <p class="also-pct">${item.matchPct}% match</p>
        </div>
      </div>
    `
      )
      .join("");

    show("screen-results");
  }

  function animateNumber(el, from, to, duration, cb) {
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      cb(Math.round(from + (to - from) * ease));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ── Restart ───────────────────────────────────────────
  function restart() {
    state.quizIndex = 0;
    state.quizAnswers = {};
    state.ratingPool = [];
    state.ratingIndex = 0;
    state.ratings = {};
    state.engine = null;
    show("screen-landing");
  }

  $("#btn-restart").addEventListener("click", restart);
  $("#btn-restart2").addEventListener("click", restart);
})();
