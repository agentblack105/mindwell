"""
risk_service.py
---------------
Dual-track risk prediction:

  1. rules_v1   — pure PHQ-9/GAD-7 band mapping (deterministic, explainable)
  2. logreg_v1  — Logistic Regression trained on synthetic feature vectors

The ML model trains on-the-fly from DB data using lightweight sklearn.
No model file persistence needed for MVP — retrain on each startup or on-demand.
A real deployment would checkpoint the model to disk/S3.

Both methods return the same interface:
  {
    "predicted_risk": "low" | "moderate" | "high",
    "confidence":     float  [0.0–1.0],
    "explanation":    dict
  }
"""
from __future__ import annotations
import logging

logger = logging.getLogger("smart_mental.risk")

# ---------------------------------------------------------------------------
# Severity → risk mapping (thesis baseline)
# ---------------------------------------------------------------------------

_SEVERITY_TO_RISK = {
    # PHQ-9
    "minimal": "low",
    "mild": "low",
    "moderate": "moderate",
    "moderately severe": "high",
    "severe": "high",
    # GAD-7 duplicates (same keys map correctly)
}

# Confidence assigned to rules-based predictions (deterministic = high confidence)
_RULES_CONFIDENCE = {
    "low": 0.95,
    "moderate": 0.90,
    "high": 0.95,
}


# ---------------------------------------------------------------------------
# Rules-based baseline (rules_v1)
# ---------------------------------------------------------------------------

def rules_v1(assessment_data: dict) -> dict:
    """
    Pure rules-based risk prediction.

    Parameters
    ----------
    assessment_data : dict
        Must contain 'tool', 'score', 'severity', 'flags_json'

    Returns
    -------
    dict with predicted_risk, confidence, explanation
    """
    severity = assessment_data.get("severity", "minimal")
    flags = assessment_data.get("flags_json") or {}
    score = assessment_data.get("score", 0)
    tool = assessment_data.get("tool", "phq9")

    # Self-harm flag always overrides to high
    if flags.get("self_harm"):
        return {
            "predicted_risk": "high",
            "confidence": 0.99,
            "explanation": {
                "method": "rules_v1",
                "model_version": "1.0",
                "rule": "self_harm_flag_override",
                "severity": severity,
                "score": score,
                "tool": tool,
            },
        }

    risk = _SEVERITY_TO_RISK.get(severity, "moderate")
    return {
        "predicted_risk": risk,
        "confidence": _RULES_CONFIDENCE.get(risk, 0.85),
        "explanation": {
            "method": "rules_v1",
            "model_version": "1.0",
            "rule": "severity_band_mapping",
            "severity": severity,
            "score": score,
            "tool": tool,
        },
    }


# ---------------------------------------------------------------------------
# Feature engineering (shared between methods)
# ---------------------------------------------------------------------------

def _build_features(assessment_data: dict) -> list[float]:
    """
    Convert assessment data into a numeric feature vector.
    [score_normalised, is_phq9, is_gad7, has_self_harm_flag]
    """
    tool = assessment_data.get("tool", "phq9")
    score = assessment_data.get("score", 0)
    flags = assessment_data.get("flags_json") or {}

    # Normalise score: PHQ-9 max=27, GAD-7 max=21
    max_score = 27.0 if tool == "phq9" else 21.0
    score_norm = score / max_score

    return [
        score_norm,
        1.0 if tool == "phq9" else 0.0,
        1.0 if tool == "gad7" else 0.0,
        1.0 if flags.get("self_harm") else 0.0,
    ]


def _severity_to_label(severity: str) -> str:
    return _SEVERITY_TO_RISK.get(severity, "moderate")


# ---------------------------------------------------------------------------
# ML model (logreg_v1) — sklearn Logistic Regression
# ---------------------------------------------------------------------------

class LogRegRiskModel:
    """
    Lightweight Logistic Regression trained from historical assessment data.

    Usage:
      model = LogRegRiskModel()
      model.fit(assessments)       # list of dicts from DB
      result = model.predict(assessment_data)
    """

    def __init__(self) -> None:
        self.clf = None
        self.classes_ = ["low", "moderate", "high"]
        self.is_fitted = False
        self.model_version = "1.0"
        self.training_samples = 0

    def fit(self, assessments: list[dict]) -> "LogRegRiskModel":
        """Train on a list of assessment dicts from DB."""
        if len(assessments) < 5:
            logger.warning("Insufficient training data (%d samples) for ML model.", len(assessments))
            return self

        try:
            from sklearn.linear_model import LogisticRegression
            from sklearn.preprocessing import LabelEncoder

            X = [_build_features(a) for a in assessments]
            y = [_severity_to_label(a.get("severity", "minimal")) for a in assessments]

            # Encode labels → integers
            le = LabelEncoder()
            le.fit(["low", "moderate", "high"])
            y_enc = le.transform(y)

            self.clf = LogisticRegression(max_iter=500, random_state=42)
            self.clf.fit(X, y_enc)
            self.classes_ = list(le.classes_)
            self.is_fitted = True
            self.training_samples = len(assessments)
            logger.info("LogReg model fitted on %d samples.", len(assessments))

        except Exception as exc:
            logger.error("LogReg fit failed: %s", exc)

        return self

    def predict(self, assessment_data: dict) -> dict:
        """Predict risk for a single assessment. Falls back to rules_v1 if not fitted."""
        if not self.is_fitted or self.clf is None:
            logger.warning("ML model not fitted, falling back to rules_v1.")
            result = rules_v1(assessment_data)
            result["explanation"]["fallback"] = "model_not_fitted"
            return result

        features = [_build_features(assessment_data)]
        proba = self.clf.predict_proba(features)[0]
        pred_idx = int(proba.argmax())
        predicted_risk = self.classes_[pred_idx]
        confidence = round(float(proba[pred_idx]), 4)

        return {
            "predicted_risk": predicted_risk,
            "confidence": confidence,
            "explanation": {
                "method": "logreg_v1",
                "model_version": self.model_version,
                "training_samples": self.training_samples,
                "features": _build_features(assessment_data),
                "class_probabilities": {
                    cls: round(float(p), 4) for cls, p in zip(self.classes_, proba)
                },
            },
        }


# Global model instance (lazy-fitted on first request or via /risk/train)
_model_instance: LogRegRiskModel | None = None


def get_model() -> LogRegRiskModel:
    global _model_instance
    if _model_instance is None:
        _model_instance = LogRegRiskModel()
    return _model_instance
