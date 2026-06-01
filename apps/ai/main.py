from fastapi import FastAPI, HTTPException

from schemas import BatchRiskPredictionInput, RiskPredictionInput
from services.model_service import ModelLoadError, model_service

app = FastAPI(
    title="PINTARIN AI Inference Service",
    version="1.0.0",
    description="Risk scoring and hybrid recommendation service for PINTARIN.",
)


@app.on_event("startup")
def startup_event():
    model_service.load()


@app.get("/health")
def health_check():
    return {
        "success": True,
        "service": "pintarin-ai-service",
        "status": "ready" if model_service.is_ready() else "not_ready",
        "model_version": model_service.model_version,
    }


@app.post("/predict-risk")
def predict_risk(payload: RiskPredictionInput):
    try:
        return {
            "success": True,
            "message": "Risk prediction generated successfully",
            "data": model_service.predict_one(payload),
        }
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except ModelLoadError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {error}") from error


@app.post("/predict-batch")
def predict_batch(payload: BatchRiskPredictionInput):
    try:
        return {
            "success": True,
            "message": "Batch risk prediction generated successfully",
            "count": len(payload.records),
            "data": model_service.predict_batch(payload.records),
        }
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except ModelLoadError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {error}") from error