from typing import Optional

from fastapi import APIRouter, Header, HTTPException

from app.schemas.prediction_schema import PredictionRequest, PredictionResponse
from app.services import prediction_service
from app.utils.config import settings

router = APIRouter()


def _check_internal_api_key(x_internal_api_key: Optional[str]):
    if settings.INTERNAL_API_KEY and x_internal_api_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing internal API key")


@router.post("/predict-demand", response_model=PredictionResponse)
def predict_demand(
    payload: PredictionRequest,
    x_internal_api_key: Optional[str] = Header(default=None),
):
    """
    Called by the Node.js backend (see backend/src/services/mlService.js),
    not directly by the frontend or the public internet
    (ARCHITECTURE.md section 6).
    """
    _check_internal_api_key(x_internal_api_key)
    try:
        return prediction_service.predict(payload)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc
