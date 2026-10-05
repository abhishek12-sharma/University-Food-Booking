"""
Feature engineering shared by both offline training (training/train.py) and
live inference (services/prediction_service.py) so the two never drift apart.

Only features derivable from data that actually exists per DATABASE_SCHEMA.md
(orders, order_items) are used -- nothing here is invented, per the member 6
brief's "Do not fabricate training data" / "Use features supported by
available historical data" rules.
"""

import pandas as pd

FEATURE_COLUMNS = [
    "day_of_week",
    "is_weekend",
    "hour_of_day",
    "rolling_avg_7d",
    "previous_day_demand",
    "previous_week_demand",
]


def build_training_features(orders_df: pd.DataFrame) -> pd.DataFrame:
    """
    orders_df must have columns:
      food_item_id, food_court_id, order_date (date-like), hour_of_day (int),
      quantity (int -- total units sold in that food_item/food_court/date/hour bucket)

    Returns a dataframe with FEATURE_COLUMNS + 'quantity' (the training target).
    """
    df = orders_df.copy()
    df["order_date"] = pd.to_datetime(df["order_date"])
    df = df.sort_values(["food_item_id", "food_court_id", "order_date", "hour_of_day"])

    df["day_of_week"] = df["order_date"].dt.dayofweek
    df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)

    group_cols = ["food_item_id", "food_court_id"]

    # Daily totals per item/food-court, used to build rolling / lag features.
    # Everything is shifted by at least 1 day so a day's own total never
    # leaks into its own features.
    daily = (
        df.groupby(group_cols + ["order_date"])["quantity"]
        .sum()
        .reset_index()
        .sort_values(group_cols + ["order_date"])
    )
    daily["rolling_avg_7d"] = daily.groupby(group_cols)["quantity"].transform(
        lambda s: s.shift(1).rolling(window=7, min_periods=1).mean()
    )
    daily["previous_day_demand"] = daily.groupby(group_cols)["quantity"].shift(1)
    daily["previous_week_demand"] = daily.groupby(group_cols)["quantity"].shift(7)

    df = df.merge(
        daily[group_cols + ["order_date", "rolling_avg_7d", "previous_day_demand", "previous_week_demand"]],
        on=group_cols + ["order_date"],
        how="left",
    )

    for col in ["rolling_avg_7d", "previous_day_demand", "previous_week_demand"]:
        df[col] = df[col].fillna(0)

    result = df[FEATURE_COLUMNS + ["quantity"]].copy()
    return result.dropna()


def build_inference_features(target_date, hour_of_day: int, recent_history: pd.DataFrame) -> dict:
    """
    recent_history: dataframe of the last ~14 days of daily quantity for a
    single food_item/food_court, columns ['order_date', 'quantity']. May be
    empty if there is no history yet -- in that case the lag/rolling features
    default to 0 rather than being fabricated.
    """
    target_date = pd.to_datetime(target_date)
    day_of_week = target_date.dayofweek
    is_weekend = int(day_of_week in (5, 6))

    if recent_history is None or recent_history.empty:
        rolling_avg_7d = 0.0
        previous_day_demand = 0.0
        previous_week_demand = 0.0
    else:
        recent_history = recent_history.sort_values("order_date")
        last_7 = recent_history.tail(7)["quantity"]
        rolling_avg_7d = float(last_7.mean()) if len(last_7) else 0.0

        prev_day_rows = recent_history[recent_history["order_date"] == target_date - pd.Timedelta(days=1)]
        previous_day_demand = float(prev_day_rows["quantity"].iloc[0]) if len(prev_day_rows) else 0.0

        prev_week_rows = recent_history[recent_history["order_date"] == target_date - pd.Timedelta(days=7)]
        previous_week_demand = float(prev_week_rows["quantity"].iloc[0]) if len(prev_week_rows) else 0.0

    return {
        "day_of_week": day_of_week,
        "is_weekend": is_weekend,
        "hour_of_day": hour_of_day,
        "rolling_avg_7d": rolling_avg_7d,
        "previous_day_demand": previous_day_demand,
        "previous_week_demand": previous_week_demand,
    }
