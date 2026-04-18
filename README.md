# 🎬 CineMatch

**Stop scrolling. Start watching.**

CineMatch is a smart movie & TV show recommendation web app. Answer a few preference questions, rate some titles you've seen, and the engine finds your perfect match.

---

## ✨ Features

- **6-question preference quiz** — mood, format, era, vibe, company, language
- **Rating calibration** — rate 6 known titles (1–5 stars) to tune the engine
- **Smart recommendation engine** — weighted scoring across genres, vibes, format & era
- **"Why this?" explanations** — personalized match reasons
- **4 runner-up suggestions** — alternatives you'll likely enjoy
- **30-title catalog** — curated movies and series across thriller, sci-fi, drama, comedy, horror, adventure
- **Zero dependencies** — pure HTML, CSS, Vanilla JS. No frameworks, no build step.
- **Fully responsive** — works on mobile, tablet and desktop

---

## 🗂️ File Structure

```
cinematch/
├── index.html          ← Single-page app shell (4 screens)
├── css/
│   └── style.css       ← All styles (dark cinematic theme)
├── js/
│   ├── data.js         ← Catalog, quiz questions, rating pool
│   ├── engine.js       ← Recommendation scoring engine
│   └── app.js          ← App controller / UI logic
└── README.md
```

---

## 🚀 Running Locally

No build step needed:

```bash
# Clone or download
git clone https://github.com/YOUR_USERNAME/cinematch.git
cd cinematch

# Option A — open directly
open index.html

# Option B — serve locally (avoids any browser restrictions)
npx serve .
# or
python3 -m http.server 8080
```

---

## 🧠 How the Engine Works

1. **Quiz processing** — Each answer adds weight to genre/vibe affinity maps
2. **Rating processing** — Known titles (e.g. "The Dark Knight") carry genre signals; high ratings boost those genres, low ratings reduce them
3. **Scoring** — Every catalog item is scored against:
   - Genre affinity (×30)
   - Vibe affinity (×20)
   - Format match movie/series (±20)
   - Era match (±15)
   - Language preference (±10/−20)
   - Company context (±10)
   - Intrinsic quality bonus (IMDb-based)
4. **Results** — Sorted by score, top item shown with match %, reasons & runners-up

---

## 📦 Uploading to GitHub

```bash
git init
git add .
git commit -m "Initial commit — CineMatch v1.0"
git remote add origin https://github.com/YOUR_USERNAME/cinematch.git
git branch -M main
git push -u origin main
```

Then enable **GitHub Pages** under `Settings → Pages → Source: main / root` to get a live URL.

---

## 🛠️ Extending

- **Add titles** — Add objects to `CATALOG` in `js/data.js`
- **Add quiz questions** — Add to `QUIZ_QUESTIONS` array
- **Tune scoring** — Adjust multipliers in `engine.js → score()`
- **Styling** — All CSS variables are in `:root` in `style.css`

---

## 📄 License

MIT — free to use and modify.
