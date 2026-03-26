"""
intent_service.py
-----------------
Rule-based intent classifier for chat messages.
Designed to be fast, deterministic, and testable — no ML required.

Intents (in priority order):
  1. crisis           — detected by crisis_service, not here
  2. results_explain  — user asking about their assessment results
  3. resources_request — user asking for resources / referrals
  4. coping_tips      — user asking for coping strategies
  5. general_support  — fallback: empathetic listening

Returns a plain string intent name.
"""
from __future__ import annotations

# ---------------------------------------------------------------------------
# Keyword hint sets per intent (all lowercase)
# ---------------------------------------------------------------------------

RESULTS_KEYWORDS = {
    "score", "result", "results", "assessment", "phq", "gad", "test", "quiz",
    "what does", "what do", "what did", "my score", "my result", "severity",
    "moderate", "severe", "minimal", "mild", "explain", "mean", "means",
}

RESOURCES_KEYWORDS = {
    "resource", "resources", "help", "clinic", "hospital", "hotline", "support",
    "therapy", "therapist", "counsellor", "counselor", "psychologist", "refer",
    "referral", "where can i", "where do i", "find help", "seek help",
    "mental health service",
}

COPING_KEYWORDS = {
    "tip", "tips", "cope", "coping", "feel better", "manage", "calm",
    "breathing", "relax", "relaxation", "exercise", "sleep", "distract",
    "strategy", "strategies", "grounding", "mindful", "mindfulness",
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def detect_intent(text: str) -> str:
    """
    Classify a user message into one of the supported intents.

    Note: 'crisis' is handled upstream by crisis_service before this is called.
    This function assumes crisis has already been checked.

    Parameters
    ----------
    text : str
        The raw user message (any case).

    Returns
    -------
    str — one of: "results_explain", "resources_request", "coping_tips", "general_support"
    """
    words = set(text.lower().split())
    text_lower = text.lower()

    # Check multi-word phrases and individual tokens
    if _matches(words, text_lower, RESULTS_KEYWORDS):
        return "results_explain"

    if _matches(words, text_lower, RESOURCES_KEYWORDS):
        return "resources_request"

    if _matches(words, text_lower, COPING_KEYWORDS):
        return "coping_tips"

    return "general_support"


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _matches(words: set[str], text_lower: str, keywords: set[str]) -> bool:
    """Check if any keyword touches the word set or is a substring of the full text."""
    return bool(words & keywords) or any(kw in text_lower for kw in keywords if " " in kw)
