"""
Orchestrates a single prediction request: builds features, calls the model,
and returns a response that is honest about limitations rather than
fabricating confidence the model doesn't have (member 6 brief, ML rules).
"""

import os

import pandas as pd

from app.preprocessing.feature_engineering import build_inference_features
from app.schemas.prediction_schema import PredictionRequest, PredictionResponse
from app.services import model_service
from app.utils.config import settings


def _hour_from_time_slot(time_slot):
    if not time_slot:
        return 12  # default to midday if no slot is given
    try:
        return int(time_slot.split("-")[0].split(":")[0])
    except (ValueError, IndexError):
        return 12


def get_recent_history(food_item_id: int, food_court_id: int, before_date) -> pd.DataFrame:
    """
    Reads recent daily demand for this item/food-court from the local extract
    produced by training/train.py (data/daily_demand.csv). Returns an empty
    dataframe -- not fabricated numbers -- when no extract is on disk yet.
    """
    history_path = os.path.normpath(
        os.path.join(settings.MODEL_DIR, "..", "data", "daily_demand.csv")
    )
    if not os.path.exists(history_path):
        return pd.DataFrame(columns=["order_date", "quantity"])

    df = pd.read_csv(history_path, parse_dates=["order_date"])
    df = df[
        (df["food_item_id"] == food_item_id)
        & (df["food_court_id"] == food_court_id)
        & (df["order_date"] < pd.to_datetime(before_date))
    ]
    return df.sort_values("order_date").tail(14)[["order_date", "quantity"]]


def predict(request: PredictionRequest) -> PredictionResponse:
    try:
        artifact = model_service.load_model()
    except model_service.ModelNotAvailableError as exc:
        # Do not fabricate a number when there is no trained model.
        return PredictionResponse(
            foodItemId=request.foodItemId,
            foodCourtId=request.foodCourtId,
            targetDate=request.targetDate,
            timeSlot=request.timeSlot,
            predictedDemand=0.0,
            modelVersion="none",
            isDecisionSupportOnly=True,
            warning=str(exc),
        )

    history = get_recent_history(request.foodItemId, request.foodCourtId, request.targetDate)

    warning = None
    if history.empty:
        warning = (
            "No historical data found for this food item / food court combination. "
            "Prediction falls back to the model's learned baseline and should be "
            "treated with low confidence."
        )

    hour = _hour_from_time_slot(request.timeSlot)
    features = build_inference_features(request.targetDate, hour, history)
    predicted = artifact.predict(features)

    return PredictionResponse(
        foodItemId=request.foodItemId,
        foodCourtId=request.foodCourtId,
        targetDate=request.targetDate,
        timeSlot=request.timeSlot,
        predictedDemand=round(predicted, 2),
        modelVersion=artifact.version,
        isDecisionSupportOnly=True,
        warning=warning,
    )
