"""
sentiment_service.py
--------------------
Lightweight lexicon-based sentiment analyser.

Goals:
  - Zero external dependencies (no API keys, no model downloads)
  - Deterministic and testable
  - Fast enough to run in the background after every chat message

Algorithm
---------
1. Tokenise text into lowercase words
2. Score each word against positive / negative lexicons
3. Apply negation smoothing ("not happy" flips "happy")
4. Normalise to [-1.0, +1.0] and derive label

Output
------
  {"label": "negative", "score": -0.67}

These are comprehensive but concise lexicons suitable for mental health chat context.
Words chosen to cover emotional expression rather than product sentiment.
"""
from __future__ import annotations
import re

# ---------------------------------------------------------------------------
# Lexicons (mental-health-aware)
# ---------------------------------------------------------------------------

POSITIVE_WORDS = {
    # Hope / recovery
    "better", "good", "great", "happy", "hopeful", "improving", "okay",
    "positive", "recovered", "recovering", "relief", "relieved", "safe",
    "supported", "thankful", "grateful", "calm", "peaceful", "well",
    "fine", "strong", "motivated", "energised", "energized", "loved",
    "connected", "confident", "proud", "hopeful", "optimistic", "healing",
    "progressing", "coping", "managing", "appreciated", "understood",
    "encouraged", "inspired", "joy", "content", "comfortable", "relaxed",
    "cheerful", "upbeat", "excited", "grateful", "blessed",
}

NEGATIVE_WORDS = {
    # Distress / depression
    "terrible", "awful", "horrible", "miserable", "depressed", "depression",
    "anxious", "anxiety", "panic", "scared", "fearful", "trapped", "empty",
    "numb", "hopeless", "worthless", "useless", "broken", "lost", "lonely",
    "isolated", "abandoned", "rejected", "hurt", "pain", "suffering",
    "struggling", "overwhelmed", "exhausted", "tired", "burnt", "burnout",
    "drained", "lost", "confused", "helpless", "powerless", "devastated",
    "heartbroken", "grief", "grieving", "crying", "sad", "unhappy", "bad",
    "terrible", "failed", "failure", "shame", "ashamed", "guilty", "guilt",
    "regret", "angry", "rage", "frustrated", "irritated", "upset", "worried",
    "stressed", "distressed", "disturbed", "terrified", "horrified",
}

# Negation words — flip polarity of the next sentiment word
NEGATORS = {"not", "no", "never", "none", "nothing", "nobody", "neither",
            "nor", "barely", "hardly", "scarcely", "don't", "doesn't",
            "didn't", "can't", "won't", "isn't", "aren't", "wasn't"}

# Intensifiers — amplify the following word's score
INTENSIFIERS = {"very", "extremely", "really", "so", "absolutely", "totally",
                "completely", "utterly", "deeply", "terribly", "incredibly"}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def analyse(text: str) -> dict:
    """
    Analyse sentiment of a text string.

    Parameters
    ----------
    text : str — raw user message

    Returns
    -------
    dict with keys:
      label : "positive" | "neutral" | "negative"
      score : float in [-1.0, +1.0]
    """
    tokens = _tokenise(text)
    raw_score = _score_tokens(tokens)
    normalised = _normalise(raw_score, len(tokens))
    label = _label(normalised)
    return {"label": label, "score": round(normalised, 4)}


def rolling_stats(scores: list[float]) -> dict:
    """
    Compute rolling sentiment statistics from a list of per-message scores.

    Parameters
    ----------
    scores : list[float] — ordered list of scores (oldest first)

    Returns
    -------
    dict:
      average     : float  — mean score across all messages
      recent_avg  : float  — mean of last 5 messages
      neg_streak  : int    — consecutive count of negative-scoring messages at tail
      volatility  : float  — std dev of scores (proxy for instability)
    """
    if not scores:
        return {"average": 0.0, "recent_avg": 0.0, "neg_streak": 0, "volatility": 0.0}

    avg = sum(scores) / len(scores)
    recent = scores[-5:]
    recent_avg = sum(recent) / len(recent)

    # Negative streak from the tail
    streak = 0
    for s in reversed(scores):
        if s < 0:
            streak += 1
        else:
            break

    # Volatility (population std dev)
    mean = avg
    variance = sum((s - mean) ** 2 for s in scores) / len(scores)
    volatility = variance ** 0.5

    return {
        "average": round(avg, 4),
        "recent_avg": round(recent_avg, 4),
        "neg_streak": streak,
        "volatility": round(volatility, 4),
    }


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _tokenise(text: str) -> list[str]:
    return re.findall(r"\b\w+\b", text.lower())


def _score_tokens(tokens: list[str]) -> float:
    score = 0.0
    negate = False
    intensify = 1.0

    for token in tokens:
        if token in NEGATORS:
            negate = True
            continue
        if token in INTENSIFIERS:
            intensify = 1.5
            continue

        word_score = 0.0
        if token in POSITIVE_WORDS:
            word_score = 1.0
        elif token in NEGATIVE_WORDS:
            word_score = -1.0

        if word_score != 0.0:
            if negate:
                word_score *= -0.7  # negation softens, doesn't fully flip
            word_score *= intensify
            score += word_score

        # Reset modifiers after applying
        negate = False
        intensify = 1.0

    return score


def _normalise(raw_score: float, word_count: int) -> float:
    """Normalise raw score to [-1, +1] using a smoothed denominator."""
    if word_count == 0:
        return 0.0
    # Denominator: max possible score given word count (generous ceiling)
    ceiling = max(word_count * 0.5, 1.0)
    return max(-1.0, min(1.0, raw_score / ceiling))


def _label(score: float) -> str:
    if score > 0.1:
        return "positive"
    if score < -0.1:
        return "negative"
    return "neutral"
