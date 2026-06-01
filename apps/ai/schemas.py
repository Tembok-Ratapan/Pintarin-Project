from typing import List, Optional
from pydantic import BaseModel, Field


class RiskPredictionInput(BaseModel):
    kecamatan: str = Field(..., examples=["MANDALAJATI"])
    rasio_pip_per_rentan: float = Field(..., ge=0)
    rasio_sd_per_populasi: float = Field(..., ge=0)
    gap_bantuan: float
    urgency_score: float
    total_pra_sekolah: float = Field(..., ge=0)
    tahun_norm: float = Field(..., ge=0, le=1)


class BatchRiskPredictionInput(BaseModel):
    records: List[RiskPredictionInput]


class ProbabilityOutput(BaseModel):
    rendah: float
    sedang: float
    tinggi: float


class RiskPredictionOutput(BaseModel):
    kecamatan: str
    predicted_label: str
    predicted_class: int
    risk_score_pct: float
    confidence_score: float
    priority_score: Optional[float] = None
    priority_score_pct: Optional[float] = None
    probabilities: ProbabilityOutput
    recommendation: str
    model_version: str