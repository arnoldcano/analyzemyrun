from fastapi import APIRouter
from app.api.v1.endpoints import auth, workouts, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(workouts.router, prefix="/workouts", tags=["workouts"])
api_router.include_router(users.router, prefix="/users", tags=["users"])

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"} 