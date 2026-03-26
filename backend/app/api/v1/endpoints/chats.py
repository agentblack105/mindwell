from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Any
import uuid

from app.db.session import get_db
from app.api.deps import SessionDep
from app.schemas.chat import ChatSessionResponse, ChatMessageResponse, ChatMessageCreate
from app.models.chat import ChatSession, ChatMessage
from app.models.safety import SafetyEvent
from app.models.sentiment import SentimentEvent
from app.services import crisis_service, intent_service, sentiment_service
from app.services.referral_service import generate_referrals
from app.core.templates import get_template

router = APIRouter()


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

async def _build_bot_response(
    content: str,
    lang: str,
    session_id: uuid.UUID,
    db: AsyncSession,
) -> tuple[str, dict]:
    """Crisis → intent → multilingual template pipeline."""
    crisis_eval = crisis_service.evaluate(user_text=content)

    if crisis_service.is_high_crisis(crisis_eval):
        return get_template("crisis_high", lang), crisis_eval

    if crisis_eval["crisis_level"] == "watch":
        return get_template("crisis_watch", lang), crisis_eval

    intent = intent_service.detect_intent(content)

    if intent == "resources_request":
        resources = await generate_referrals(db=db, risk_level="severe")
        if resources:
            lines = "\n".join(
                f"• {r['name']} — {r.get('phone') or r.get('url', '')}" for r in resources[:3]
            )
            return f"{get_template('resources_request', lang)}\n\n{lines}", crisis_eval
        return get_template("resources_request", lang), crisis_eval

    if intent == "results_explain":
        from app.models.assessment import Assessment
        result = await db.execute(
            select(Assessment)
            .where(Assessment.session_id == session_id)
            .order_by(Assessment.created_at.desc())
            .limit(1)
        )
        latest = result.scalar_one_or_none()
        base = get_template("results_explain", lang)
        if latest:
            detail = (
                f"\n\nYour most recent **{latest.tool.upper()}** result: "
                f"**Score {latest.score}** — *{latest.severity}*."
            )
            return base + detail, crisis_eval
        return base, crisis_eval

    return get_template(intent, lang), crisis_eval


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/start", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_chat(
    current_session: SessionDep,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Start a new chat session with an initial greeting."""
    chat = ChatSession(session_id=current_session.id)
    db.add(chat)
    await db.commit()
    await db.refresh(chat)

    initial = ChatMessage(
        chat_session_id=chat.id,
        role="assistant",
        content="Hello! I'm here to listen and help you find support. What's on your mind today?",
        language_original="en",
    )
    db.add(initial)
    await db.commit()

    result = await db.execute(
        select(ChatSession)
        .options(selectinload(ChatSession.messages))
        .where(ChatSession.id == chat.id)
    )
    return result.scalar_one()


@router.post("/{chat_id}/message", response_model=list[ChatMessageResponse])
async def send_message(
    chat_id: uuid.UUID,
    message_in: ChatMessageCreate,
    current_session: SessionDep,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Send a user message to the chat.

    Pipeline (in order):
      1. Crisis detection  — hard override if high crisis
      2. Intent detection  — routes to appropriate response template
      3. Sentiment scoring — written asynchronously to sentiment_events
      4. Safety logging    — SafetyEvent written if any crisis detected
    """
    chat_result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == chat_id,
            ChatSession.session_id == current_session.id,
        )
    )
    chat = chat_result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if message_in.role != "user":
        raise HTTPException(status_code=400, detail="Only 'user' role is allowed for inputs")

    lang = message_in.language or current_session.language or "en"

    # Persist user message
    user_msg = ChatMessage(
        chat_session_id=chat.id,
        role="user",
        content=message_in.content,
        language_original=lang,
    )
    db.add(user_msg)
    await db.flush()

    # --- 1 + 2: Safety + intent dispatch ---
    bot_text, crisis_eval = await _build_bot_response(
        content=message_in.content,
        lang=lang,
        session_id=current_session.id,
        db=db,
    )

    # --- 3: Sentiment scoring (runs on user message only) ---
    sentiment = sentiment_service.analyse(message_in.content)
    db.add(SentimentEvent(
        session_id=current_session.id,
        message_id=user_msg.id,
        label=sentiment["label"],
        score=sentiment["score"],
    ))

    # --- 4: Safety logging ---
    if crisis_service.is_any_crisis(crisis_eval):
        db.add(SafetyEvent(
            session_id=current_session.id,
            event_type="chat_keyword",
            details_json={
                "chat_session_id": str(chat_id),
                "message_id": str(user_msg.id),
                "crisis_level": crisis_eval["crisis_level"],
                "triggered_by": crisis_eval["triggered_by"],
                "matched_keywords": crisis_eval["matched_keywords"],
            },
        ))

    ai_msg = ChatMessage(
        chat_session_id=chat.id,
        role="assistant",
        content=bot_text,
        language_original=lang,
    )
    db.add(ai_msg)

    await db.commit()
    await db.refresh(user_msg)
    await db.refresh(ai_msg)

    return [user_msg, ai_msg]


@router.get("/{chat_id}/history", response_model=ChatSessionResponse)
async def get_chat_history(
    chat_id: uuid.UUID,
    current_session: SessionDep,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get the full history of a chat session."""
    chat_result = await db.execute(
        select(ChatSession)
        .options(selectinload(ChatSession.messages))
        .where(
            ChatSession.id == chat_id,
            ChatSession.session_id == current_session.id,
        )
    )
    chat = chat_result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat
