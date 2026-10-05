import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME: str = "Food Demand Prediction Service"
    HOST: str = os.getenv("ML_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("ML_PORT", "8000"))

    # Optional internal auth so this service is not casually callable from
    # outside the Node.js backend (ARCHITECTURE.md section 6).
    INTERNAL_API_KEY: str = os.getenv("INTERNAL_API_KEY", "")

    # Used only by the offline training scripts (training/train.py,
    # training/evaluate.py), never by the live prediction API.
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "university_food_system")

    MODEL_DIR: str = os.getenv(
        "MODEL_DIR", os.path.join(os.path.dirname(__file__), "..", "..", "model")
    )
    MODEL_FILENAME: str = os.getenv("MODEL_FILENAME", "demand_model.joblib")

    # Minimum training rows required before train.py will fit a model at all.
    # Prevents shipping a model trained on data too sparse to mean anything
    # (member 6 brief: "Do not fabricate accuracy").
    MIN_TRAINING_ROWS: int = int(os.getenv("MIN_TRAINING_ROWS", "200"))


settings = Settings()
