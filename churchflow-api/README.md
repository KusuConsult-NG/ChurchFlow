# ChurchFlow API (separated)
Next.js API-only service with Prisma + PostgreSQL.

## Deploy to Vercel
1. Create a Postgres DB (Neon/Supabase/Render).
2. Set env vars (Production + Preview):
   - `DATABASE_URL=...` (append `?sslmode=require`)
   - `JWT_SECRET=` (long random string)
   - `CORS_ORIGIN=https://your-frontend.vercel.app`
3. Deploy. Build step runs migrations automatically (`prisma migrate deploy`).

## Endpoints
- `POST /api/auth/register` — { fullName, email, password }
- `POST /api/auth/login` — returns { token, user }
- `GET /api/me` — current user + memberships
- `POST /api/org/create` — create org (assigns SUPER_ADMIN to caller)
- `GET/POST /api/finance/income`
- `GET/POST /api/finance/expenditures`
- `GET/PATCH /api/finance/expenditures/[id]`
- `GET/POST /api/hr/staff`
- `POST /api/hr/payroll`
- `GET/POST /api/hr/leave`
- `GET /api/health`

## Local Dev
```bash
cp .env.example .env
# fill DATABASE_URL/JWT_SECRET
npm i
npx prisma migrate dev --name init
npm run dev
```
