from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import prediction
from app.services.model_service import model_is_available
from app.utils.config import settings

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

# This service is only meant to be called by the Node.js backend, not the
# public internet or the browser directly (ARCHITECTURE.md section 6).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(prediction.router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "modelLoaded": model_is_available(),
    }
