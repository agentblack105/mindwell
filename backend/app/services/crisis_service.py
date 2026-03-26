"""
crisis_service.py
-----------------
Evaluates safety signals from two sources:
  1. Assessment flags (e.g. PHQ-9 Q9 > 0)
  2. Free-text chat messages (keyword matching)

Returns a structured crisis evaluation:
  {
    "crisis_level": "none" | "watch" | "high",
    "actions": [...],
    "matched_keywords": [...],
    "triggered_by": "assessment_flag" | "chat_keyword" | "both"
  }

Keyword lists are conservative (false positive > false negative for safety).
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Keyword lists — order matters: more specific phrases first
# ---------------------------------------------------------------------------

# "high" triggers immediate crisis response + hotlines
HIGH_KEYWORDS: list[str] = [
    "kill myself",
    "end my life",
    "take my life",
    "want to die",
    "wish i was dead",
    "no reason to live",
    "better off dead",
    "planning to die",
    "don't want to be here",
    "tired of living",
    "suicide",
    "suicidal",
    "hurt myself",
    "harm myself",
    "cut myself",
    "overdose",
]

# "watch" triggers a gentler check-in but no hard override
WATCH_KEYWORDS: list[str] = [
    "hopeless",
    "worthless",
    "can't go on",
    "can't cope",
    "no way out",
    "nobody cares",
    "no one cares",
    "pointless",
    "give up",
    "given up",
    "disappear",
    "meaningless",
    "can't take it",
    "falling apart",
]

# ---------------------------------------------------------------------------
# Actions returned per crisis level
# ---------------------------------------------------------------------------

ACTIONS_HIGH = [
    "show_crisis_hotlines",
    "recommend_immediate_professional_help",
    "restrict_bot_to_safe_responses",
    "log_safety_event",
]

ACTIONS_WATCH = [
    "show_support_resources",
    "recommend_professional_help",
    "log_safety_event",
]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def evaluate(
    assessment_flags: dict | None = None,
    user_text: str | None = None,
) -> dict:
    """
    Evaluate combined safety signals.

    Parameters
    ----------
    assessment_flags : dict | None
        Flags dict from scoring service, e.g. {"self_harm": true}
    user_text : str | None
        Raw user message text (not normalised — do matching case-insensitively)

    Returns
    -------
    dict with keys: crisis_level, actions, matched_keywords, triggered_by
    """
    assessment_flags = assessment_flags or {}
    user_text_lower = (user_text or "").lower()

    high_matches = _match_keywords(user_text_lower, HIGH_KEYWORDS)
    watch_matches = _match_keywords(user_text_lower, WATCH_KEYWORDS)

    flag_triggered = bool(assessment_flags.get("self_harm"))
    text_high = len(high_matches) > 0
    text_watch = len(watch_matches) > 0

    # ---- determine crisis level ----
    if flag_triggered or text_high:
        crisis_level = "high"
        actions = ACTIONS_HIGH
        matched = high_matches
        triggered_by = _triggered_by(flag_triggered, text_high or text_watch)
    elif text_watch:
        crisis_level = "watch"
        actions = ACTIONS_WATCH
        matched = watch_matches
        triggered_by = "chat_keyword"
    else:
        return {
            "crisis_level": "none",
            "actions": [],
            "matched_keywords": [],
            "triggered_by": None,
        }

    return {
        "crisis_level": crisis_level,
        "actions": actions,
        "matched_keywords": matched,
        "triggered_by": triggered_by,
    }


def is_high_crisis(evaluation: dict) -> bool:
    """Convenience helper."""
    return evaluation.get("crisis_level") == "high"


def is_any_crisis(evaluation: dict) -> bool:
    """Convenience helper — true for both 'watch' and 'high'."""
    return evaluation.get("crisis_level") in ("watch", "high")


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _match_keywords(text_lower: str, keywords: list[str]) -> list[str]:
    return [kw for kw in keywords if kw in text_lower]


def _triggered_by(flag: bool, text: bool) -> str:
    if flag and text:
        return "both"
    if flag:
        return "assessment_flag"
    return "chat_keyword"
