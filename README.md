# 🎬 CineMatch v2

**Stop scrolling. Start watching.**

A smart movie & TV show recommendation web app with **real TMDB poster images**, a live **Navier-Stokes fluid dynamics background**, and a personalised taste engine.

---

## ✨ What's New in v2

| Feature | v1 | v2 |
|---|---|---|
| Movie posters | Emoji placeholders | Real TMDB images |
| Background | Static gradient orbs | Live fluid dynamics (Navier-Stokes) |
| Data source | Hardcoded | TMDB API + pre-fetched paths |
| Interactions | Buttons only | Fluid responds to mouse/touch |
| Poster fallback | Emoji | Gradient + emoji if no API key |

---

## 🖼️ Getting Real Poster Images (TMDB API)

The app **works without an API key** — all 30 poster paths are pre-baked in. But with a key you get live data fetching.

### Get a free TMDB key (takes 30 seconds)
1. Create a free account at [themoviedb.org](https://www.themoviedb.org/signup)
2. Go to **Settings → API → Create → Developer**
3. Copy your **API Key (v3 auth)** or **Read Access Token (v4)**

### Add it to the app
Open `js/data.js` and fill in one of these:

```javascript
const TMDB_CONFIG = {
  API_KEY: "your_api_key_here",         // v3 key
  // OR
  ACCESS_TOKEN: "your_token_here",      // v4 Bearer token
  ...
};
```

> **Note:** TMDB requires attribution. The app already displays the TMDB logo in the results screen.

---

## 🌊 Fluid Dynamics

The background uses a real **Navier-Stokes fluid simulation** (`js/fluid.js`):

- **Velocity field** — 2D incompressible fluid solved with Gauss-Seidel relaxation
- **Dye advection** — Three-channel RGB dye carried by the velocity field
- **Auto-swirl** — Periodic force injection creates organic motion
- **Mouse/touch reactive** — Move your cursor to stir the fluid
- **Click interaction** — Hold/tap for stronger forces
- **Color modes** — Switches between gold (quiz), purple (rating), and cinema (landing/results)
- **Quiz interaction** — Selecting an answer bursts gold fluid
- **Star rating** — Each star rating fires a unique colored burst

---

## 🗂️ File Structure

```
cinematch/
├── index.html          ← Single-page app (4 screens)
├── css/
│   └── style.css       ← Full styles — luxury cinema aesthetic
├── js/
│   ├── data.js         ← TMDB config, catalog (30 titles), quiz, rating pool
│   ├── fluid.js        ← Navier-Stokes fluid simulation (pure JS/Canvas2D)
│   ├── engine.js       ← Weighted recommendation engine
│   └── app.js          ← App controller, TMDB fetching, UI logic
└── README.md
```

---

## 🚀 Running Locally

```bash
# No build step — open directly or serve:
npx serve .
# or
python3 -m http.server 8080
```

> TMDB API calls require HTTP (localhost works fine). For GitHub Pages: HTTPS is already handled.

---

## 📦 Upload to GitHub

```bash
git init
git add .
git commit -m "Initial commit — CineMatch v2 with TMDB + fluid dynamics"
git remote add origin https://github.com/YOUR_USERNAME/cinematch.git
git branch -M main
git push -u origin main
```

Enable **GitHub Pages** under `Settings → Pages → main / root` for a free live URL.

### Files to upload (all of them)
```
index.html
css/style.css
js/data.js
js/fluid.js
js/engine.js
js/app.js
README.md
.gitignore
```

### Files to delete from v1 (if upgrading)
The old v1 had no `js/fluid.js` — just add the new files. Replace all others.

---

## 🧠 How the Recommendation Engine Works

1. **Quiz** → genre + vibe affinity map built from 6 answers  
2. **Ratings** → Known titles (e.g. "The Dark Knight") carry genre signals; high ratings boost, low ratings reduce affinity  
3. **Scoring** each catalog item on:
   - Genre affinity ×30
   - Vibe affinity ×20
   - Format match (movie/series) ±20
   - Era match ±15
   - Language preference ±10/−20
   - Company context ±10
   - Intrinsic quality (TMDB rating) ×5
4. **Sort + present** top match with reasons, + 4 runner-ups

---

## 📄 License

MIT — free to use, modify, and deploy.

> This product uses the TMDB API but is not endorsed or certified by TMDB.
