"""
risk.py
-------
Risk prediction endpoints.

GET  /risk/predict/{assessment_id}  — predict risk using both methods; store results
POST /risk/train                    — (re)train the ML model from DB data
GET  /risk/compare                  — compare rules vs ML predictions across DB

These endpoints enable the thesis evaluation chapter:
"How well does ML agree with the clinically-validated rules baseline?"
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any
import uuid

from app.db.session import get_db
from app.api.deps import SessionDep
from app.api.admin_deps import get_current_admin
from app.models.assessment import Assessment
from app.models.risk import RiskPrediction
from app.services import risk_service

router = APIRouter()


def _assessment_to_dict(a: Assessment) -> dict:
    return {
        "tool": a.tool,
        "score": a.score,
        "severity": a.severity,
        "flags_json": a.flags_json or {},
    }


# ---------------------------------------------------------------------------
# Public (session-authenticated)
# ---------------------------------------------------------------------------

@router.get("/predict/{assessment_id}", response_model=dict)
async def predict_risk(
    assessment_id: uuid.UUID,
    current_session: SessionDep,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Predict risk level for an assessment using both methods.
    Stores results to risk_predictions; returns side-by-side comparison.
    """
    result = await db.execute(
        select(Assessment).where(
            Assessment.id == assessment_id,
            Assessment.session_id == current_session.id,
        )
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    data = _assessment_to_dict(assessment)

    # rules_v1
    rules = risk_service.rules_v1(data)
    # logreg_v1 (uses global singleton; may fall back to rules if untrained)
    ml = risk_service.get_model().predict(data)

    # Persist both predictions
    for pred, method in [(rules, "rules_v1"), (ml, ml["explanation"].get("method", "logreg_v1"))]:
        db.add(RiskPrediction(
            assessment_id=assessment_id,
            method=method,
            model_version=pred["explanation"].get("model_version", "1.0"),
            predicted_risk=pred["predicted_risk"],
            confidence=pred["confidence"],
            explanation_json=pred["explanation"],
        ))

    await db.commit()

    return {
        "assessment_id": str(assessment_id),
        "tool": data["tool"],
        "score": data["score"],
        "severity": data["severity"],
        "predictions": {
            "rules_v1": {
                "predicted_risk": rules["predicted_risk"],
                "confidence": rules["confidence"],
            },
            "logreg_v1": {
                "predicted_risk": ml["predicted_risk"],
                "confidence": ml["confidence"],
                "explanation": ml["explanation"],
            },
        },
        "agreement": rules["predicted_risk"] == ml["predicted_risk"],
    }


# ---------------------------------------------------------------------------
# Admin routes
# ---------------------------------------------------------------------------

@router.post("/train", response_model=dict)
async def train_model(
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
) -> Any:
    """Admin-only: (Re)train the LogReg model from all assessments in DB."""
    result = await db.execute(
        select(
            Assessment.tool,
            Assessment.score,
            Assessment.severity,
            Assessment.flags_json,
        )
    )
    rows = result.all()
    assessments = [
        {"tool": r[0], "score": r[1], "severity": r[2], "flags_json": r[3] or {}}
        for r in rows
    ]

    model = risk_service.get_model()
    model.fit(assessments)

    if model.is_fitted:
        return {
            "status": "trained",
            "training_samples": model.training_samples,
            "model_version": model.model_version,
        }
    return {
        "status": "insufficient_data",
        "training_samples": len(assessments),
        "message": "Need at least 5 assessments to train. Rules baseline will continue to be used.",
    }


@router.get("/compare", response_model=dict)
async def compare_methods(
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
) -> Any:
    """
    Admin-only: Compare rules vs ML accuracy.
    Counts agreements, disagreements, and confidence distribution.
    Useful for the thesis evaluation chapter.
    """
    result = await db.execute(select(RiskPrediction))
    predictions = result.scalars().all()

    if not predictions:
        return {"message": "No predictions stored yet. Call /risk/predict/{id} first."}

    by_assessment: dict[str, dict] = {}
    for p in predictions:
        key = str(p.assessment_id)
        if key not in by_assessment:
            by_assessment[key] = {}
        by_assessment[key][p.method] = p.predicted_risk

    total = 0
    agreements = 0
    disagreements = []

    for assessment_id, preds in by_assessment.items():
        if "rules_v1" in preds and ("logreg_v1" in preds or "rules_v1" in preds):
            rules_pred = preds.get("rules_v1")
            ml_pred = preds.get("logreg_v1", rules_pred)  # fallback means same
            total += 1
            if rules_pred == ml_pred:
                agreements += 1
            else:
                disagreements.append({
                    "assessment_id": assessment_id,
                    "rules_v1": rules_pred,
                    "logreg_v1": ml_pred,
                })

    agreement_rate = round(agreements / total, 4) if total > 0 else 0.0

    return {
        "total_assessments_evaluated": total,
        "agreements": agreements,
        "disagreements": len(disagreements),
        "agreement_rate": agreement_rate,
        "disagreement_details": disagreements[:10],  # cap at 10 for response size
        "interpretation": (
            "High agreement (>0.85) confirms the rules baseline is well-calibrated. "
            "Disagreements highlight borderline cases worth clinical review."
        ),
    }
