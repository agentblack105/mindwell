from fastapi import APIRouter, HTTPException
from typing import Any
from app.core.questionnaires import QUESTIONNAIRES

router = APIRouter()

@router.get("", response_model=dict[str, str])
async def list_questionnaires() -> Any:
    """List available questionnaire tools."""
    return {k: v["name"] for k, v in QUESTIONNAIRES.items()}

@router.get("/{tool}", response_model=dict[str, Any])
async def get_questionnaire(tool: str, lang: str = "en") -> Any:
    """Get the specific questionnaire metadata and questions. Currently only supports English."""
    if tool not in QUESTIONNAIRES:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    
    # In Phase 6 (Multilingual), we will translate this structure based on the lang param.
    return QUESTIONNAIRES[tool]
