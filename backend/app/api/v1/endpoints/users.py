from fastapi import APIRouter, Depends
from app.api import deps
from app.schemas.user import User

router = APIRouter()

@router.get("/me", response_model=User)
def get_current_user(
    current_user = Depends(deps.get_current_user),
):
    """
    Get current user.
    """
    return current_user 