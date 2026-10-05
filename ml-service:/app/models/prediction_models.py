"""
Defines what a trained model artifact looks like and how to use it to
predict. This is deliberately separate from services/model_service.py:

- prediction_models.py: the shape of a trained artifact + how to call it.
- services/model_service.py: loading/caching that artifact for the running app.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List


@dataclass
class DemandModelArtifact:
    estimator: Any
    feature_columns: List[str]
    version: str
    trained_at: str
    metrics: Dict[str, float] = field(default_factory=dict)

    def predict(self, feature_row: Dict[str, float]) -> float:
        """
        feature_row must contain (at least) every column in feature_columns.
        Missing columns default to 0 rather than raising, so a request with
        partial feature availability still gets a (clearly-flagged) estimate.
        """
        ordered_values = [[feature_row.get(col, 0) for col in self.feature_columns]]
        prediction = self.estimator.predict(ordered_values)[0]
        # Demand cannot be negative.
        return max(0.0, float(prediction))
