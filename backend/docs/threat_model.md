# Threat Model + Privacy Notes

## System Context

Smart-Mental is an anonymous mental health screening API. Users have no accounts — interactions are tied to ephemeral session tokens. No PII is collected by design.

---

## Assets

| Asset | Sensitivity | Notes |
|-------|------------|-------|
| Session tokens (in-flight) | HIGH | Sent as plaintext header — must use HTTPS end-to-end |
| Token hashes (DB) | LOW | SHA-256; cannot be reversed to raw token |
| Assessment scores + severity | MEDIUM | Linked to session ID only, never to a person |
| Chat message text | HIGH | May contain sensitive mental health disclosures |
| Admin JWT | HIGH | Full admin access; short expiry |
| Crisis trigger logs | MEDIUM | Needed for safety audit; session-ID only |

---

## Threat Actors

| Actor | Motivation | Capability |
|-------|-----------|------------|
| Anonymous external attacker | Data exfiltration, denial of service | Medium |
| Malicious user | Bypass screening, abuse chatbot | Low |
| Compromised admin JWT | Full resource/export access | High (JWT stolen) |
| Internal threat | Access to DB data | Low (data is pseudonymous) |

---

## STRIDE Analysis

| Threat | Mitigation |
|--------|-----------|
| **S**poofing session | Token is SHA-256 hashed; collision infeasible |
| **T**ampering assessment answers | Answers validated + scored server-side; client score ignored |
| **R**epudiation of crisis events | `safety_events` table is append-only; never deleted by normal flows |
| **I**nformation disclosure | No PII stored; admin exports anonymized; HTTPS enforced via Nginx |
| **D**enial of Service | SlowAPI rate limits on session creation (5/min), chat (20/min), assessments (10/min) |
| **E**levation of privilege | Admin endpoints protected by JWT; separate `get_current_admin` dependency |

---

## NDPR / Data Privacy Compliance (Nigeria)

| Requirement | Implementation |
|-------------|---------------|
| Data minimisation | No names, emails, IP addresses stored in DB |
| Purpose limitation | Data used only for screening + safety monitoring |
| Storage limitation | `SESSION_RETENTION_DAYS=90` env var; `POST /admin/exports/cleanup` deletes expired data |
| Consent | `POST /v1/consent` required before assessments; stored with policy version + timestamp |
| Security | HTTPS, hashed tokens, secure headers (HSTS, X-Frame-Options), rate limiting |
| Right to erasure | Session deletion cascades to all linked data |

---

## Secret Rotation

All secrets are environment variables. Rotation procedure:
1. Update `.env` with new `SECRET_KEY` / DB password
2. Restart the API container (`docker compose restart api`)
3. Any existing admin JWTs are immediately invalidated (no code change needed)

---

## Known Limitations (Thesis MVP)

- Admin JWT does not support refresh tokens or revocation lists (acceptable for MVP)
- Rate limiting uses in-memory counters (resets on restart); production should use Redis backend for persistence
- Crisis keyword matching is lexical (English-first); for Pidgin, templates translate responses but keyword detection is weighted toward English cognates
