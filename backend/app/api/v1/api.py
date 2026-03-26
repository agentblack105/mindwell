from fastapi import APIRouter
from app.api.v1.endpoints import sessions, questionnaires, assessments, resources, referrals, admin_auth, analytics, chats, sentiment, exports, risk

api_router = APIRouter()
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(questionnaires.router, prefix="/questionnaires", tags=["questionnaires"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
api_router.include_router(resources.router, prefix="/resources", tags=["resources"])
api_router.include_router(referrals.router, prefix="/referrals", tags=["referrals"])
api_router.include_router(admin_auth.router, prefix="/admin/auth", tags=["admin_auth"])
api_router.include_router(analytics.router, prefix="/admin/analytics", tags=["analytics"])
api_router.include_router(exports.router, prefix="/admin/exports", tags=["exports"])
api_router.include_router(chats.router, prefix="/chats", tags=["chats"])
api_router.include_router(sentiment.router, prefix="/sentiment", tags=["sentiment"])
api_router.include_router(risk.router, prefix="/risk", tags=["risk"])
