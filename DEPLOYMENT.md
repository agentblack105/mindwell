# Deployment Guide

This repo is set up for:

- `frontend/` -> Vercel
- `backend/` -> Render web service
- database -> managed Postgres such as Neon, Supabase, or Render Postgres

## Recommended Order

Deploy in this order so the URLs line up cleanly:

1. Create the Postgres database
2. Deploy the backend on Render
3. Copy the backend public URL
4. Deploy the frontend on Vercel using that backend URL
5. Update backend CORS with the final Vercel domain and redeploy once

## Backend on Render

You can use the root [`render.yaml`](/Users/victoradaigbe/Desktop/Smart-Mental-2/render.yaml), or create the service manually in the Render dashboard.

### Render Screen-By-Screen

1. In Render, click `New +`
2. Choose `Web Service`
3. Connect this GitHub repo
4. Set `Root Directory` to `backend`
5. Set `Runtime` to `Python 3`
6. Set `Build Command` to `pip install -r requirements.txt`
7. Set `Pre-Deploy Command` to `alembic upgrade head`
8. Set `Start Command` to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
9. Set `Health Check Path` to `/health`
10. Pick the instance type you want
11. Add the environment variables below
12. Click `Create Web Service`

### Backend Environment Variables

Set these in Render:

- `SECRET_KEY`
  Example: a long random string such as `change-this-to-a-long-random-secret`
- `DATABASE_URL`
  Example: `postgresql://USER:PASSWORD@HOST:5432/DBNAME`
- `BACKEND_CORS_ORIGINS`
  Example: `["https://your-project.vercel.app"]`
- `LOG_LEVEL`
  Value: `INFO`

Optional:

- `SESSION_RETENTION_DAYS`
  Value: `90`

Notes:

- `DATABASE_URL` is preferred for production and takes precedence over the `POSTGRES_*` variables.
- `DATABASE_URL` may be `postgres://...`, `postgresql://...`, or `postgresql+asyncpg://...`. The backend normalizes it.
- `BACKEND_CORS_ORIGINS` can be a JSON array or a comma-separated string.
- If you want both local dev and production to work from the same backend, you can use:

```text
["http://localhost:5173","https://your-project.vercel.app"]
```

### Backend Health Check

After deploy, confirm this opens successfully:

```text
https://your-render-service.onrender.com/health
```

You should get a JSON response with `status: "ok"`.

## Frontend on Vercel

This frontend is a Vite app inside the `frontend` directory.

It uses hash routing, so you do not need a special SPA rewrite for page refreshes on Vercel.

### Vercel Screen-By-Screen

1. In Vercel, click `Add New...`
2. Choose `Project`
3. Import this GitHub repo
4. Set `Root Directory` to `frontend`
5. Confirm the framework is `Vite`
6. Leave `Install Command` as default
7. Set `Build Command` to `npm run build`
8. Set `Output Directory` to `dist`
9. Add the environment variables below
10. Click `Deploy`

### Frontend Environment Variables

Set these in Vercel:

- `VITE_API_BASE_URL`
  Recommended value: `https://your-render-service.onrender.com`
- `VITE_GEMINI_API_KEY`
  Optional. Leave blank if you do not want browser-side Gemini calls.

Notes:

- `VITE_API_BASE_URL` can be either the backend root URL or the full `/api/v1` URL.
- The frontend normalizes both of these correctly:

```text
https://your-render-service.onrender.com
https://your-render-service.onrender.com/api/v1
```

- Any `VITE_` variable is exposed to the browser bundle. Do not put secrets there unless you are comfortable with them being visible to clients.

## Final CORS Update

Once Vercel gives you the final frontend URL, go back to Render and update:

- `BACKEND_CORS_ORIGINS`

Use the real Vercel production domain, for example:

```text
["https://mindwell.vercel.app"]
```

If you also use a custom domain, include both:

```text
["https://mindwell.vercel.app","https://mindwell.example.com"]
```

Then trigger a redeploy on Render.

## Database

Preferred production setup:

- create a managed Postgres database
- copy its external connection string
- set that value as `DATABASE_URL`
- let Render run `alembic upgrade head` during deploy

## Repo Hygiene

This repo should not track local-only files such as:

- `backend/.env`
- `backend/.venv/`
- `backend/mental/`
- `__pycache__/`
- `.pyc`
- `desktop.ini`
