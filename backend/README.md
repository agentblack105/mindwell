# Smart-Mental Backend

Anonymous mental health screening API. PHQ-9/GAD-7 scoring, safety layer, guided chatbot, resource referrals, multilingual (EN + Nigerian Pidgin), and admin analytics.

---

## Quick Start (Local)

```bash
# 1. Clone and navigate to backend
cd backend

# 2. Copy env config
cp .env.example .env
# Edit .env — set SECRET_KEY and DB credentials

# 3. Start services
docker compose up -d        # starts api + postgres
docker compose exec api alembic upgrade head   # apply migrations

# 4. Verify
curl http://localhost:8000/health
# → {"status": "ok", "version": "1.0.0"}
```

---

## Local Dev (without Docker)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Set env vars (or .env file)
export SECRET_KEY="change-me-in-production"
export POSTGRES_SERVER=localhost
export POSTGRES_DB=smartmental

alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

---

## Run Tests

```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. pytest tests/ -v
```

---

## API Endpoints

### Sessions
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/sessions` | — | Create anonymous session |
| POST | `/api/v1/sessions/consent` | Session | Record consent |

### Questionnaires & Assessments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/questionnaires` | — | List available tools |
| GET | `/api/v1/questionnaires/{tool}` | — | Get questions (add `?lang=pcm`) |
| POST | `/api/v1/assessments/{tool}` | Session | Submit + score + safety check |
| GET | `/api/v1/assessments/history` | Session | Session assessment history |

### Resources & Referrals
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/resources` | — | Public resource list |
| POST | `/api/v1/referrals/generate` | Session | Rules-based referrals by risk level |

### Chat
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/chats/start` | Session | Start chat session |
| POST | `/api/v1/chats/{id}/message` | Session | Send message (crisis → intent → i18n) |
| GET | `/api/v1/chats/{id}/history` | Session | Full chat history |

### Sentiment
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/sentiment/session` | Session | Rolling sentiment trend |
| GET | `/api/v1/sentiment/admin/overview` | Admin JWT | Population-level metrics |

### Admin
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/admin/auth/login` | — | Get admin JWT |
| POST | `/api/v1/admin/resources` | Admin JWT | Create resource |
| PUT | `/api/v1/admin/resources/{id}` | Admin JWT | Update resource |
| DELETE | `/api/v1/admin/resources/{id}` | Admin JWT | Delete resource |
| GET | `/api/v1/admin/analytics` | Admin JWT | System metrics |
| GET | `/api/v1/admin/exports` | Admin JWT | Anonymized export (`?from=&to=`) |
| POST | `/api/v1/admin/exports/cleanup` | Admin JWT | Delete expired sessions (NDPR) |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | — | **Required.** JWT signing key + admin password seed |
| `POSTGRES_SERVER` | `localhost` | DB host |
| `POSTGRES_DB` | `smartmental` | DB name |
| `POSTGRES_USER` | `postgres` | DB user |
| `POSTGRES_PASSWORD` | `postgres` | DB password |
| `BACKEND_CORS_ORIGINS` | `["http://localhost:3000"]` | JSON list of allowed origins |
| `SESSION_RETENTION_DAYS` | `90` | NDPR data retention cutoff |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

---

## Production Deploy

```bash
# 1. Set environment
cp .env.example .env && nano .env

# 2. Obtain TLS certificates (Certbot)
certbot certonly --standalone -d your-domain.com

# 3. Update docker/nginx.conf with your domain

# 4. Launch
docker compose -f docker/docker-compose.prod.yml up -d
```

---

## Documentation

| Doc | Path |
|-----|------|
| Architecture | [`docs/architecture.md`](docs/architecture.md) |
| DB Schema | [`docs/schema.md`](docs/schema.md) |
| Threat Model | [`docs/threat_model.md`](docs/threat_model.md) |
| OpenAPI (live) | `http://localhost:8000/api/v1/openapi.json` |
