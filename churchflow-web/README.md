# ChurchFlow Web (separated)
Next.js 14 frontend that talks to the separate API.

## Env
Create `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=https://your-api.vercel.app/api
```

## Dev
```
npm i
npm run dev
```

## Deploy to Vercel
- Import this repo as a project.
- Add `NEXT_PUBLIC_API_BASE_URL` for Production/Preview.
- Ensure `public/favicon.ico` exists (already included).
