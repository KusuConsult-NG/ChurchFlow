# ChurchFlow API (Updated for New Frontend)

A small, clean Express + Prisma API that matches the new ChurchFlow UI screens:
- **Finance** → income & expenditures
- **HR** → staff & payroll
- **Assets** → register & list
- **Auth** → register & login (JWT)
- **Health** endpoint for deployment checks

**Production DB remains empty** by default. Use the seed **only** for local dev.

---

## Quick Start (Local)

```bash
cp .env.example .env     # fill in DATABASE_URL & JWT_SECRET
npm i
npx prisma migrate dev --name init
npm run dev
```

Test:
- `GET http://localhost:8080/health` → `{ ok: true, db: true }`

---

## Deploy

1. Provision Postgres (Neon/Supabase/Render). Use `?sslmode=require` in `DATABASE_URL`.
2. Set envs:
   - `DATABASE_URL`
   - `JWT_SECRET` (long random string)
   - `FRONTEND_ORIGIN` (e.g. https://churchflow.vercel.app)
3. Build & run:
   - On platforms with build steps: `npm run build` then `npm start`
   - Prisma migrations run with `prisma migrate deploy` during build

---

## Endpoints (v1)

- `POST /auth/register` → `{ user }`
- `POST /auth/login` → `{ token, user }`

- `GET /finance/income` · `POST /finance/income`
- `GET /finance/expenditures` · `POST /finance/expenditures`

- `GET /hr/staff` · `POST /hr/staff`
- `GET /hr/payroll` · `POST /hr/payroll`

- `GET /assets` · `POST /assets`

> All non-auth endpoints require `Authorization: Bearer <token>`

---

## Notes

- Input validation uses **zod**.
- CORS allowlist uses `FRONTEND_ORIGIN`.
- Keep the DB **empty in production**; connect your UI later when needed.
