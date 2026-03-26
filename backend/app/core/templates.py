"""
templates.py
------------
Response template registry keyed by (intent, language_code).

Supported languages:
  * en  — English (default)
  * pcm — Nigerian Pidgin

Adding a new language: extend TEMPLATES with a new language key per intent.
If a language+intent combo is missing, falls back to English.

Template variables (substituted at call time):
  {session_token}  — not used in templates
  {crisis_line_ng} — crisis hotline for Nigeria
  {crisis_line_int} — international crisis hotline
"""
from __future__ import annotations

# Fallback language
_DEFAULT_LANG = "en"

CRISIS_LINE_NG = "0800 800 2000"
CRISIS_LINE_INT = "text HOME to 741741"

# ---------------------------------------------------------------------------
# Template registry
# Format: TEMPLATES[intent][lang] = str
# ---------------------------------------------------------------------------

TEMPLATES: dict[str, dict[str, str]] = {
    "crisis_high": {
        "en": (
            "I'm really concerned about what you've shared. "
            "Please reach out to a crisis support line right away — "
            "you don't have to face this alone.\n\n"
            f"🇳🇬 Nigeria: {CRISIS_LINE_NG} (Suicide Prevention)\n"
            f"🌍 International: {CRISIS_LINE_INT}\n\n"
            "Is there someone you trust who can be with you right now?"
        ),
        "pcm": (
            "I dey very worried about wetin you don share. "
            "Please call crisis line now now — you no need face am alone.\n\n"
            f"🇳🇬 Nigeria: {CRISIS_LINE_NG}\n"
            f"🌍 International: {CRISIS_LINE_INT}\n\n"
            "Abi there person wey you trust wey fit stay with you now?"
        ),
    },
    "crisis_watch": {
        "en": (
            "It sounds like things have been really hard lately. "
            "What you're feeling matters and help is available. "
            "Would you like me to find some support resources near you?"
        ),
        "pcm": (
            "E sound like say things don dey very tough for you. "
            "How you dey feel matter, and help dey available. "
            "You want make I find support resources near you?"
        ),
    },
    "results_explain": {
        "en": (
            "Your assessment gives us a snapshot of how you've been feeling. "
            "A higher score generally means more intense symptoms — "
            "a trained professional can explain exactly what your results mean for you. "
            "Would you like me to suggest next steps or find a therapist near you?"
        ),
        "pcm": (
            "Your assessment show us how you don dey feel lately. "
            "Higher score mean the symptoms dey more intense — "
            "therapist fit explain wetin your result mean for you properly. "
            "You want I suggest next step or find therapist near you?"
        ),
    },
    "resources_request": {
        "en": (
            "I can help find support resources near you. "
            "Could you tell me which state you're in so I can suggest relevant options?"
        ),
        "pcm": (
            "I fit help find support resources near you. "
            "Which state you dey? Make I suggest options wey dey near you."
        ),
    },
    "coping_tips": {
        "en": (
            "Here are a few things that can help in difficult moments:\n"
            "• **Grounding (5-4-3-2-1):** Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste\n"
            "• **Slow breathing:** Breathe in for 4 seconds, hold for 4, out for 6\n"
            "• **Move your body:** Even a 5-minute walk can shift your mood\n"
            "• **Talk to someone:** Sharing reduces isolation\n\n"
            "Would you like more strategies for a specific feeling?"
        ),
        "pcm": (
            "These things fit help when things dey tough:\n"
            "• **Grounding (5-4-3-2-1):** Call 5 things wey you see, 4 wey you fit touch, 3 wey you hear\n"
            "• **Breathe slow:** Breathe in 4 seconds, hold 4, breathe out 6 seconds\n"
            "• **Move small:** Even 5-minute walk fit change your mood\n"
            "• **Talk to somebody:** Sharing dey help\n\n"
            "You want more strategy for specific feeling?"
        ),
    },
    "general_support": {
        "en": (
            "I hear you, and it sounds really tough. "
            "Can you tell me a bit more about how long you've been feeling this way?"
        ),
        "pcm": (
            "I dey hear you, e sound very tough. "
            "You fit tell me small about how long you don dey feel this way?"
        ),
    },
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_template(intent: str, lang: str = "en") -> str:
    """
    Retrieve a response template for the given intent and language.
    Falls back to English if the language is not supported.

    Parameters
    ----------
    intent : str  — one of the keys in TEMPLATES
    lang   : str  — BCP-47 code like 'en', 'pcm'

    Returns
    -------
    str — the template string, ready to return as-is
    """
    intent_templates = TEMPLATES.get(intent, TEMPLATES["general_support"])
    return intent_templates.get(lang) or intent_templates.get(_DEFAULT_LANG, "")


def supported_languages() -> list[str]:
    """Return list of language codes that have at least one template."""
    langs: set[str] = set()
    for intent_dict in TEMPLATES.values():
        langs.update(intent_dict.keys())
    return sorted(langs)
