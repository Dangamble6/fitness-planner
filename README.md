# Fitness Planner — Setup & Deployment

A personal fitness tracker PWA. Works offline, installs to your iPhone home screen, feels like a native app. No backend required — all data lives in your browser's local storage.

## What's in the zip

```
fitness-planner/
├── index.html              iOS PWA meta tags, splash screens
├── package.json            Vite + React
├── vite.config.js          Build config
├── vercel.json             Deployment config (SPA routing + SW headers)
├── supabase-schema.sql     Optional DB schema for future cloud sync
├── .gitignore
├── public/
│   ├── manifest.json       PWA manifest (standalone mode, icons)
│   ├── sw.js               Service worker (offline caching)
│   ├── icon-152.png        Various icon sizes for iOS/iPadOS
│   ├── icon-167.png
│   ├── icon-180.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── splash-750x1334.png     iPhone SE splash
│   ├── splash-1170x2532.png    iPhone 14/15/16 splash
│   ├── splash-1179x2556.png    iPhone 15/16 Pro splash
│   └── splash-1290x2796.png    iPhone Pro Max splash
└── src/
    ├── main.jsx            React entry point
    └── App.jsx             Full app code
```

---

## Deploy to Vercel (5 minutes)

### 1. Push to GitHub

From the unzipped folder:

```bash
cd fitness-planner
git init
git add .
git commit -m "Fitness Planner v1.0"
```

Create a new empty repo at github.com/new, then run the commands GitHub shows you (roughly):

```bash
git remote add origin https://github.com/YOUR_USERNAME/fitness-planner.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project" and import your fitness-planner repo
3. Framework preset will auto-detect as Vite — leave everything default
4. Click Deploy

Your app will be live at something like `https://fitness-planner.vercel.app` in about 30 seconds.

### 3. Install on your iPhone

1. Open your Vercel URL in **Safari** (this only works in Safari, not Chrome on iPhone)
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap **Add to Home Screen**
4. The name should prefill as "Fitness Planner" — tap Add

The app will now:
- Launch full-screen (no browser chrome at all)
- Show the splash screen on load
- Have its own icon on your home screen
- Work offline for everything you've already loaded
- Behave like a native app (swipe gestures, standalone app switcher)

---

## Local development

If you want to run/modify the app locally:

```bash
cd fitness-planner
npm install
npm run dev
```

Opens at http://localhost:5173. Any edits to `src/App.jsx` hot-reload instantly.

---

## How your data is stored

Everything — workouts, weights, photos, PBs, custom videos — is stored in **localStorage** on your device. This means:

- ✅ Fully private, never leaves your phone
- ✅ Works offline
- ✅ No accounts or passwords
- ⚠️ If you clear Safari's website data, it will be wiped
- ⚠️ If you uninstall the home screen app without exporting first, it's gone

Use **Settings → Export Data** regularly to save a JSON backup. You can keep these in iCloud Drive, email them to yourself, etc.

---

## About the photos

Photos are automatically compressed on upload (max 1200px longest side, JPEG 80%). A typical iPhone photo drops from ~4MB to ~200KB, so you can realistically store 20+ weeks × 3 angles within iOS Safari's storage limits.

If you ever hit the limit (browser throws an error on upload), export your data, clear some older weeks, and reimport.

---

## About YouTube ads

The app uses `youtube-nocookie.com` embeds for privacy, but **YouTube ads can't be removed from embeds** — that's a YouTube policy, not a technical limitation.

To watch demo videos without ads:
- **YouTube Premium** (£13.99/mo) — works across all YouTube
- Tap "**Open on YouTube**" in the exercise info modal to open the full YouTube app, then use a Safari content blocker like **AdGuard** or **1Blocker** (one-time £2–3 on the App Store)
- Pin specific muted/trimmed clips to your own unlisted YouTube channel and set those as custom videos in Settings → Exercise videos

---

## Future: cloud sync (optional)

If you ever want to back up to the cloud and sync across devices:

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run `supabase-schema.sql` in the SQL Editor
4. Add your Supabase URL and anon key to a `.env` file
5. Install `@supabase/supabase-js` and wire up the sync logic

Completely optional — the app works perfectly without it.

---

## Troubleshooting

**App won't install from Safari**
- Make sure you're using Safari (not Chrome)
- The URL must be HTTPS (Vercel URLs always are)
- Try reloading the page before tapping Share

**Fonts look wrong / reverted to system font**
- The first launch needs internet to download Fraunces + Geist
- After that, they're cached and work offline

**Changes not appearing after editing code**
- The service worker caches aggressively. In dev tools: Application → Service Workers → Unregister, then reload
- Or bump the `CACHE_NAME` version string in `public/sw.js` and redeploy

**Photos fail to save**
- Storage limit hit. Export your data, delete old weeks in the app, reimport.
