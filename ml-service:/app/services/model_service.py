"""
Loads and caches the trained model artifact for the running FastAPI process.
Training itself lives in training/train.py -- this module only ever reads
what that script produced.
"""

import os

import joblib

from app.models.prediction_models import DemandModelArtifact
from app.utils.config import settings

_cached_artifact = None


class ModelNotAvailableError(Exception):
    pass


def _model_path() -> str:
    return os.path.join(settings.MODEL_DIR, settings.MODEL_FILENAME)


def load_model(force_reload: bool = False) -> DemandModelArtifact:
    global _cached_artifact

    if _cached_artifact is not None and not force_reload:
        return _cached_artifact

    path = _model_path()
    if not os.path.exists(path):
        raise ModelNotAvailableError(
            f"No trained model found at {path}. Run training/train.py first."
        )

    payload = joblib.load(path)
    _cached_artifact = DemandModelArtifact(
        estimator=payload["estimator"],
        feature_columns=payload["feature_columns"],
        version=payload.get("version", "unknown"),
        trained_at=payload.get("trained_at", "unknown"),
        metrics=payload.get("metrics", {}),
    )
    return _cached_artifact


def model_is_available() -> bool:
    return os.path.exists(_model_path())
