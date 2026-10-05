"""
Loads the currently saved model and reports its stored evaluation metrics
(from the held-out test split computed in training/train.py).

Usage:
    python training/evaluate.py
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services import model_service  # noqa: E402


def main():
    try:
        artifact = model_service.load_model(force_reload=True)
    except model_service.ModelNotAvailableError as exc:
        print(str(exc))
        return

    print(f"Model version: {artifact.version}")
    print(f"Trained at:    {artifact.trained_at}")
    print(f"Feature columns: {artifact.feature_columns}")
    print("Stored evaluation metrics:")
    for metric, value in artifact.metrics.items():
        print(f"  {metric.upper()}: {value:.4f}")


if __name__ == "__main__":
    main()
