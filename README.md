# HYBRID·OS

Personal performance command center for hybrid athletes. React PWA built with Vite — installable on iPhone and Android, works offline, data persists locally.

## What's Inside

- **9-Day Cycle** — rotating Push/Pull/Legs/Rest split, not fixed Mon-Sun
- **Today tab** — readiness score, run decision engine, today's session, daily macros
- **Lift Log** — full exercise tracker with weight/reps/RIR, previous-session comparison
- **Run Log** — distance/pace/pain tracking, weekly mileage, run decision engine (locked speed work)
- **Rehab** — 4-stage tendinopathy framework with full session logging
- **Tennis** — session tracker with rehab-aware warnings
- **Nutrition** — macros + bodyweight with adjustable quick buttons
- **Recovery** — sleep, caffeine timing, alcohol, nicotine, sauna, cold plunge, HR/HRV
- **Supplements** — 9-item daily checklist with timing reminders
- **Stats** — 30-day pain trend, 8-week mileage chart, sleep bars, all-time totals
- **Settings** — targets, rehab stage, work mode, JSON import/export, reset

All data lives in your browser's `localStorage` under these keys:
- `hos-settings`, `hos-cycle`, `hos-daily`, `hos-lifts`, `hos-runs`, `hos-rehab`, `hos-tennis`

---

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production build

```bash
npm run build
npm run preview
```

The `dist/` folder contains the deployable build.

---

## Open on Your Phone Locally (same WiFi)

1. Run `npm run dev` on your computer
2. Vite will print something like `Network: http://192.168.1.123:5173`
3. Open that URL in Safari/Chrome on your phone
4. Add to Home Screen (instructions below)

---

## Deploy to Netlify (easiest)

1. Push your project to GitHub
2. Go to [netlify.com](https://netlify.com) → "Add new site" → "Import from Git"
3. Select your repo
4. Build command: `npm run build` · Publish directory: `dist`
5. Click Deploy. You get a `https://xxx.netlify.app` URL.

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → "Add New" → "Project"
3. Import your repo. Vercel auto-detects Vite.
4. Deploy.

## Deploy to GitHub Pages

```bash
npm install --save-dev gh-pages
```

Add to `package.json`:
```json
"scripts": {
  "deploy": "vite build && gh-pages -d dist"
}
```

Run `npm run deploy`.

---

## Add to iPhone Home Screen

1. Open your deployed URL (or local dev URL) in **Safari** (not Chrome — Add to Home Screen only works in Safari)
2. Tap the **Share** button (square with arrow up)
3. Scroll down → tap **Add to Home Screen**
4. Name it "Hybrid OS" → Add

The app icon appears on your home screen. Tap it — full screen, no Safari chrome, looks and feels like a native app. Data persists across opens.

## Add to Android Home Screen

1. Open the URL in Chrome
2. Tap the menu (⋮) → **Add to Home screen** or **Install app**
3. Confirm. Done.

---

## How Data Persistence Works

- **localStorage** stores all your data as JSON, keyed under `hos-*`
- Survives app closes, phone restarts, browser updates
- **Only wiped if:** you clear Safari/Chrome site data, or you uninstall the home-screen app
- **Backup option:** Settings → Export JSON. Save the file. To restore: Settings → Import JSON.

## Updating the App

When you change code and want the new version live:

1. `git commit` → `git push`
2. Netlify/Vercel auto-rebuilds and redeploys
3. Next time you open the app, the service worker pulls the update (auto-update is enabled)
4. **Your data stays intact** — code updates don't wipe localStorage

---

## What's in V1 (Built)

- All 5 main tabs + 4 log sub-tabs + 3 health sub-tabs
- Persistent localStorage for everything
- Readiness score with green/yellow/red logic
- Run decision engine (≤2 go, 3 reduce, 4+ no run)
- Speed work lock until Stage 3
- Rehab stage tracker with progression criteria
- Tennis warnings on rehab/push days
- Caffeine cutoff alerts
- Sleep debt warnings
- JSON export/import
- PWA installable on iPhone and Android
- Mobile-first with safe-area padding (notch + home indicator handled)

## V2 Ideas

- Strava OAuth import for runs
- Apple Health HRV/RHR auto-sync
- Push notifications for caffeine cutoff and bedtime
- Background rest timer between sets
- Photo progress logs
- Weekly auto-summaries Sunday night
- Coach-shareable weekly snapshots
- Voice logging for hands-free during sets

---

## ⚠️ Not Medical Advice

This app is a personal tracking tool. The rehab framework, pain thresholds, supplement guidance, and decision engines are personal heuristics based on the E3 Rehab model and general training principles. They are **not medical advice**. For tendon injuries, working with a qualified physical therapist or sports medicine doctor is strongly recommended — this app supports that work, it doesn't replace it.

---

## File Structure

```
hybrid-os/
├── package.json
├── vite.config.js
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── README.md
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   └── favicon.png
└── src/
    ├── main.jsx
    ├── App.jsx       ← the entire app
    └── index.css
```

Built with React 18, Vite 6, Tailwind 3, Recharts, Lucide React, vite-plugin-pwa.
