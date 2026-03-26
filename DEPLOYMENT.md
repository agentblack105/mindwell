# Deployment Guide

This repo is set up for:

- `frontend/` -> Vercel
- `backend/` -> Render web service (or another Python host)

## Frontend on Vercel

Create a Vercel project with `frontend` as the root directory.

Environment variables:

- `VITE_API_BASE_URL=https://your-backend-domain`
- `VITE_GEMINI_API_KEY=...` (optional, exposed to the browser because it is a `VITE_` var)

Build settings:

- Install command: default
- Build command: `npm run build`
- Output directory: `dist`

## Backend on Render

Use the root [`render.yaml`](/Users/victoradaigbe/Desktop/Smart-Mental-2/render.yaml) blueprint or create the service manually with:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Pre-deploy command: `alembic upgrade head`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`

Environment variables:

- `SECRET_KEY`
- `DATABASE_URL`
- `BACKEND_CORS_ORIGINS`
- `LOG_LEVEL=INFO`

Example CORS value:

```text
["https://your-frontend.vercel.app","https://your-custom-domain.com"]
```

## Database

Preferred production setup:

- use a managed Postgres database
- set `DATABASE_URL`
- run `alembic upgrade head` on deploy

`DATABASE_URL` can be:

- `postgresql://...`
- `postgres://...`
- `postgresql+asyncpg://...`

The backend normalizes these for SQLAlchemy async usage.

## Repo Hygiene

Before pushing, this repo should not track:

- `backend/.env`
- `backend/.venv/`
- `backend/mental/`
- `__pycache__/`
- `.pyc`
- `desktop.ini`
