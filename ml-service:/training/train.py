"""
Offline training script.

Usage:
    python training/train.py

Pulls historical order data from MySQL, engineers features, trains and
compares baseline models, and saves the best one to model/demand_model.joblib.

Honesty rules (DEVELOPMENT_RULES.md #19, member 6 brief -- ML Rules):
  - Does not fabricate training data.
  - Aborts with a clear message if there isn't enough historical data,
    rather than training (and silently shipping) a meaningless model.
  - Reports real evaluation metrics (MAE, RMSE, R2), never invented ones.
"""

import datetime as dt
import os
import sys

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.preprocessing.feature_engineering import FEATURE_COLUMNS, build_training_features  # noqa: E402
from app.utils.config import settings  # noqa: E402


def extract_historical_orders() -> pd.DataFrame:
    """
    Extracts one row per (food_item, food_court, order_date, hour) with the
    total quantity sold, from the orders/order_items tables in
    DATABASE_SCHEMA.md. Only orders that actually reached the kitchen
    (PREPARING/READY/PICKED_UP) count as real demand signal.
    """
    import pymysql

    conn = pymysql.connect(
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        database=settings.DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
    )
    try:
        query = """
            SELECT
                oi.food_item_id,
                o.food_court_id,
                DATE(o.created_at) AS order_date,
                HOUR(o.created_at) AS hour_of_day,
                SUM(oi.quantity) AS quantity
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.status IN ('PICKED_UP', 'READY', 'PREPARING')
            GROUP BY oi.food_item_id, o.food_court_id, DATE(o.created_at), HOUR(o.created_at)
        """
        with conn.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()
    finally:
        conn.close()

    return pd.DataFrame(rows)


def save_daily_demand_extract(orders_df: pd.DataFrame):
    """
    Saves a simplified daily (not hourly) demand extract used at inference
    time by prediction_service.get_recent_history() to compute
    rolling/previous-day/previous-week features for new predictions.
    """
    daily = (
        orders_df.groupby(["food_item_id", "food_court_id", "order_date"])["quantity"]
        .sum()
        .reset_index()
    )
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(data_dir, exist_ok=True)
    daily.to_csv(os.path.join(data_dir, "daily_demand.csv"), index=False)


def main():
    print("Extracting historical order data from MySQL...")
    orders_df = extract_historical_orders()
    print(f"Extracted {len(orders_df)} item/food-court/date/hour rows.")

    if len(orders_df) < settings.MIN_TRAINING_ROWS:
        print(
            f"Only {len(orders_df)} rows available; need at least "
            f"{settings.MIN_TRAINING_ROWS} to train a meaningful model. "
            "Aborting rather than shipping an unreliable model. "
            "Let more order history accumulate and re-run this script."
        )
        return

    save_daily_demand_extract(orders_df)

    print("Building features...")
    features_df = build_training_features(orders_df)
    if len(features_df) < settings.MIN_TRAINING_ROWS:
        print(
            f"Only {len(features_df)} usable rows survived feature engineering "
            f"(need {settings.MIN_TRAINING_ROWS}). Aborting."
        )
        return

    X = features_df[FEATURE_COLUMNS]
    y = features_df["quantity"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    candidates = {
        "linear_regression": LinearRegression(),
        "random_forest": RandomForestRegressor(n_estimators=200, max_depth=8, random_state=42, n_jobs=-1),
    }

    results = {}
    for name, model in candidates.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        r2 = r2_score(y_test, preds)
        results[name] = {"model": model, "mae": mae, "rmse": rmse, "r2": r2}
        print(f"{name}: MAE={mae:.3f}  RMSE={rmse:.3f}  R2={r2:.3f}")

    best_name = min(results, key=lambda n: results[n]["mae"])
    best = results[best_name]
    print(f"\nSelected best model: {best_name} (lowest MAE)")

    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    model_path = os.path.join(settings.MODEL_DIR, settings.MODEL_FILENAME)

    joblib.dump(
        {
            "estimator": best["model"],
            "feature_columns": FEATURE_COLUMNS,
            "version": f"{best_name}-{dt.date.today().isoformat()}",
            "trained_at": dt.datetime.utcnow().isoformat(),
            "metrics": {"mae": best["mae"], "rmse": best["rmse"], "r2": best["r2"]},
        },
        model_path,
    )
    print(f"Model saved to {model_path}")


if __name__ == "__main__":
    main()
