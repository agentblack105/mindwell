# Database Schema

All tables use UUID primary keys and UTC timestamps.

## `sessions`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| token_hash | VARCHAR | SHA-256 of raw token. Never raw token stored |
| language | VARCHAR | BCP-47 code, default `en` |
| created_at | TIMESTAMPTZ | |
| expires_at | TIMESTAMPTZ | Enforced by `get_current_session` dep |
| client_meta_json | JSON | Optional browser/device metadata |

## `consents`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| session_id | UUID FK → sessions | CASCADE DELETE |
| policy_version | VARCHAR | e.g. `"1.0"` |
| accepted_at | TIMESTAMPTZ | |

## `assessments`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| session_id | UUID FK → sessions | CASCADE DELETE |
| tool | VARCHAR | `"phq9"` or `"gad7"` |
| score | INTEGER | Validated sum |
| severity | VARCHAR | `minimal`/`mild`/`moderate`/`moderately severe`/`severe` |
| flags_json | JSON | `{"self_harm": true}` if PHQ-9 Q9 > 0 |
| created_at | TIMESTAMPTZ | |

## `assessment_answers`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| assessment_id | UUID FK → assessments | CASCADE DELETE |
| question_key | VARCHAR | e.g. `phq9_q1` |
| value | INTEGER | Raw answer value |

## `resources`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | VARCHAR | |
| type | VARCHAR | `hotline`/`clinic`/`therapy`/`hospital`/`education`/`community`/`support_group` |
| state | VARCHAR | Nigerian state or `"National"` |
| phone | VARCHAR | |
| email | VARCHAR | |
| url | VARCHAR | |
| hours | VARCHAR | |
| tags_json | JSON | |
| verified | BOOLEAN | Only verified resources returned to public |
| updated_at | TIMESTAMPTZ | |

## `referrals`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| session_id | UUID FK → sessions | |
| assessment_id | UUID FK → assessments | |
| risk_level | VARCHAR | |
| resources_json | JSON | Snapshot of matched resources at referral time |
| created_at | TIMESTAMPTZ | |

## `chat_sessions`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| session_id | UUID FK → sessions | CASCADE DELETE |
| is_active | BOOLEAN | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

## `chat_messages`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| chat_session_id | UUID FK → chat_sessions | CASCADE DELETE |
| role | VARCHAR | `"user"` or `"assistant"` |
| content | TEXT | |
| language_original | VARCHAR | BCP-47 code of the message |
| created_at | TIMESTAMPTZ | |

## `safety_events`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| session_id | UUID FK → sessions | CASCADE DELETE |
| event_type | VARCHAR | `assessment_flag`/`chat_keyword`/`both` |
| details_json | JSON | crisis_level, matched_keywords, message_id, etc. |
| created_at | TIMESTAMPTZ | Indexed for time-range queries |

## `sentiment_events`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| session_id | UUID FK → sessions | CASCADE DELETE |
| message_id | UUID FK → chat_messages | CASCADE DELETE |
| label | VARCHAR | `positive`/`neutral`/`negative` |
| score | FLOAT | –1.0 to +1.0 |
| created_at | TIMESTAMPTZ | Indexed |

---

## Cascade Behaviour
All foreign keys use `ON DELETE CASCADE`. Deleting a `sessions` row removes **all** linked data (consents, assessments, chat history, safety events, sentiment events) — this is the basis of NDPR data retention enforcement.
