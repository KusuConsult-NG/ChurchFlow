# ChurchFlow UI — Complete Drop-In Bundle

This package contains **everything** you need to replace the UI with the exact prototype look:
- All HTML pages in `/public`
- CSS/JS in `/public/assets`
- Favicons and `site.webmanifest` (no 404s)
- Optional `server.js` to preview locally with Node

## How to replace in your repo (seamless)

Repo: `KusuConsult-NG/ChurchFlow`

### Option A — Static deploy on Vercel (simplest)
1. Copy the entire **/public** folder into your repo root (or keep it as `/public` if your setup already uses it).
2. In Vercel, set:
   - **Framework Preset:** Other
   - **Build Command:** *(empty)*
   - **Output Directory:** `public`
3. Deploy.

### Option B — Keep your backend, serve these pages
1. Copy the **/public** folder to your server project.
2. Serve it statically (e.g., Express, Nginx). If you use Node/Express, you can use the provided `server.js`:

```bash
npm install
npm run dev
```

### What changed (per your request)
- **No appearance/theme** controls anywhere.
- **All prototype labels removed.**
- Structure and layout match the provided prototype.
- Added **favicons** and **webmanifest** to prevent missing-file errors in production.

### Files
- `/public/index.html` (Dashboard)
- `/public/members.html`
- `/public/giving.html`
- `/public/attendance.html`
- `/public/events.html`
- `/public/finance.html`
- `/public/hr.html`
- `/public/settings.html` (no appearance section)
- `/public/login.html`, `/public/signup.html`
- `/public/assets/style.css`, `/public/assets/app.js`, `/public/assets/logo.svg`
- `/public/favicon.png`, `/public/apple-touch-icon.png`, `/public/icon-512.png`, `/public/site.webmanifest`

> Swap `/public/assets/logo.svg` with your official logo if desired — no code changes needed.
