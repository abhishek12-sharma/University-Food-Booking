from datetime import date
from typing import Optional
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """
    Request body for POST /predict-demand.
    Field names use camelCase to match the JSON envelope used across
    API_CONTRACT.md and the Node.js backend.
    """
    foodItemId: int = Field(..., gt=0)
    foodCourtId: int = Field(..., gt=0)
    targetDate: date
    timeSlot: Optional[str] = Field(
        default=None,
        description=(
            "Optional time-slot label, e.g. '12:00-13:00'. If omitted, "
            "the model predicts demand around the middle of the day."
        ),
    )


class PredictionResponse(BaseModel):
    foodItemId: int
    foodCourtId: int
    targetDate: date
    timeSlot: Optional[str] = None
    predictedDemand: float
    modelVersion: str
    isDecisionSupportOnly: bool = True
    warning: Optional[str] = None
