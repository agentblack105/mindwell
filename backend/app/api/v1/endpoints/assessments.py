from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any

from app.db.session import get_db
from app.api.deps import SessionDep
from app.schemas.assessment import AssessmentSubmit, AssessmentResponse
from app.models.assessment import Assessment, AssessmentAnswer
from app.models.safety import SafetyEvent
from app.services.scoring_service import calculate_score, get_severity_band, check_critical_flags
from app.services import crisis_service
from app.core.questionnaires import QUESTIONNAIRES

# Hardcoded crisis hotlines automatically included in high-risk responses
CRISIS_HOTLINES = [
    {
        "name": "Nigeria Suicide Prevention Initiative",
        "phone": "0800 800 2000",
        "url": "https://www.nspi.org",
    },
    {
        "name": "Crisis Text Line",
        "phone": "Text HOME to 741741",
        "url": "https://www.crisistextline.org",
    },
]

router = APIRouter()


@router.post("/{tool}", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def submit_assessment(
    tool: str,
    submission: AssessmentSubmit,
    current_session: SessionDep,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Submit a PHQ-9 or GAD-7 assessment.
    Scores, persists, evaluates crisis signals, and flags hotlines if needed.
    """
    if tool not in QUESTIONNAIRES:
        raise HTTPException(status_code=404, detail="Questionnaire not found")

    # --- score + severity ---
    try:
        score = calculate_score(tool, submission.answers)
        severity = get_severity_band(tool, score)
        flags = check_critical_flags(tool, submission.answers)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # --- persist assessment ---
    assessment = Assessment(
        session_id=current_session.id,
        tool=tool,
        score=score,
        severity=severity,
        flags_json=flags,
    )
    db.add(assessment)
    await db.flush()  # get assessment.id

    for key, value in submission.answers.items():
        db.add(AssessmentAnswer(
            assessment_id=assessment.id,
            question_key=key,
            value=value,
        ))

    # --- safety evaluation (post-scoring) ---
    crisis_eval = crisis_service.evaluate(assessment_flags=flags)
    crisis_recommended = crisis_service.is_any_crisis(crisis_eval)
    crisis_hotlines_in_response = []

    if crisis_recommended:
        safety_event = SafetyEvent(
            session_id=current_session.id,
            event_type="assessment_flag",
            details_json={
                "assessment_id": str(assessment.id),
                "tool": tool,
                "crisis_level": crisis_eval["crisis_level"],
                "triggered_by": crisis_eval["triggered_by"],
                "flags": flags,
            },
        )
        db.add(safety_event)

    if crisis_service.is_high_crisis(crisis_eval):
        crisis_hotlines_in_response = CRISIS_HOTLINES

    await db.commit()
    await db.refresh(assessment)

    # Build response dict manually so we can attach crisis fields
    response_data = AssessmentResponse.model_validate(assessment).model_dump()
    response_data["crisis_recommended"] = crisis_recommended
    response_data["crisis_level"] = crisis_eval["crisis_level"]
    response_data["crisis_hotlines"] = crisis_hotlines_in_response

    return response_data


@router.get("/history", response_model=list[AssessmentResponse])
async def get_assessment_history(
    current_session: SessionDep,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Fetch session-scoped history of assessments."""
    result = await db.execute(
        select(Assessment)
        .where(Assessment.session_id == current_session.id)
        .order_by(Assessment.created_at.desc())
    )
    return result.scalars().all()
