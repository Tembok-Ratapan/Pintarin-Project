import json
import os
import pickle
from pathlib import Path
from typing import Dict, List

import numpy as np
from tensorflow import keras

from schemas import RiskPredictionInput
from services.custom_layers import AttentionLayer, FocalLoss


class ModelLoadError(RuntimeError):
    pass


class PintarinModelService:
    def __init__(self):
        self.model_dir = Path(
            os.getenv("PINTARIN_AI_MODEL_DIR", Path(__file__).resolve().parents[1] / "models")
        )
        self.metadata = None
        self.risk_model = None
        self.hybrid_model = None
        self.scaler = None
        self.le_kecamatan = None
        self.feature_cols = []
        self.inv_label_map: Dict[str, str] = {}
        self.model_version = "unknown"

    def load(self):
        metadata_path = self.model_dir / "pintarin_metadata.json"
        if not metadata_path.exists():
            raise ModelLoadError(f"Metadata file not found: {metadata_path}")

        with metadata_path.open("r", encoding="utf-8") as file:
            self.metadata = json.load(file)

        self.feature_cols = self.metadata.get("feature_cols", [])
        self.inv_label_map = self.metadata.get("inv_label_map", {})
        self.model_version = self.metadata.get("model_version", "unknown")

        risk_model_path = self.model_dir / self.metadata.get("risk_model_file", "pintarin_risk_scoring.keras")
        hybrid_model_path = self.model_dir / self.metadata.get("hybrid_model_file", "pintarin_hybrid_recommendation.keras")
        scaler_path = self.model_dir / self.metadata.get("scaler_file", "pintarin_scaler.pkl")
        encoder_path = self.model_dir / self.metadata.get("le_kecamatan_file", "pintarin_le_kecamatan.pkl")

        for required_path in [risk_model_path, hybrid_model_path, scaler_path, encoder_path]:
            if not required_path.exists():
                raise ModelLoadError(f"Required model asset not found: {required_path}")

        custom_objects = {
            "AttentionLayer": AttentionLayer,
            "FocalLoss": FocalLoss,
        }

        self.risk_model = keras.models.load_model(
            risk_model_path,
            custom_objects=custom_objects,
            compile=False,
        )
        self.hybrid_model = keras.models.load_model(
            hybrid_model_path,
            compile=False,
        )

        with scaler_path.open("rb") as file:
            self.scaler = pickle.load(file)

        with encoder_path.open("rb") as file:
            self.le_kecamatan = pickle.load(file)

    def is_ready(self):
        return all(
            item is not None
            for item in [
                self.metadata,
                self.risk_model,
                self.hybrid_model,
                self.scaler,
                self.le_kecamatan,
            ]
        )

    @staticmethod
    def normalize_kecamatan(value: str) -> str:
        return str(value or "").strip().upper()

    def get_feature_vector(self, payload: RiskPredictionInput):
        return np.array(
            [
                payload.rasio_pip_per_rentan,
                payload.rasio_sd_per_populasi,
                payload.gap_bantuan,
                payload.urgency_score,
                payload.total_pra_sekolah,
                payload.tahun_norm,
            ],
            dtype=np.float32,
        ).reshape(1, -1)

    def encode_kecamatan(self, kecamatan: str):
        normalized = self.normalize_kecamatan(kecamatan)

        if normalized not in set(self.le_kecamatan.classes_):
            raise ValueError(f"Kecamatan is not recognized by model: {normalized}")

        encoded = self.le_kecamatan.transform([normalized]).astype(np.int32)
        return encoded.reshape(-1, 1), normalized

    def make_recommendation(self, predicted_label: str, priority_score_pct: float, payload: RiskPredictionInput):
        notes: List[str] = []

        if predicted_label == "Tinggi":
            notes.append("Prioritas tinggi untuk intervensi bantuan pendidikan.")
        elif predicted_label == "Sedang":
            notes.append("Perlu pemantauan dan validasi kebutuhan wilayah.")
        else:
            notes.append("Risiko relatif rendah, tetap pantau perubahan indikator.")

        if payload.gap_bantuan > 0:
            notes.append("Gap bantuan masih perlu diperhatikan.")

        if payload.rasio_pip_per_rentan < 10:
            notes.append("Cakupan PIP terhadap warga rentan masih rendah.")

        if priority_score_pct >= 80:
            notes.append("Priority score sangat tinggi untuk rekomendasi bantuan.")
        elif priority_score_pct >= 60:
            notes.append("Priority score cukup kuat untuk dipertimbangkan.")

        return " ".join(notes)

    def predict_one(self, payload: RiskPredictionInput):
        if not self.is_ready():
            raise ModelLoadError("AI model service is not ready.")

        kecamatan_id, normalized_kecamatan = self.encode_kecamatan(payload.kecamatan)
        features = self.get_feature_vector(payload)
        scaled_features = self.scaler.transform(features)

        risk_probs = self.risk_model.predict(scaled_features, verbose=0)[0]
        predicted_class = int(np.argmax(risk_probs))
        predicted_label = self.inv_label_map.get(str(predicted_class), "Sedang")

        risk_score_pct = float(risk_probs[2] * 100.0)
        confidence_score = float(np.max(risk_probs))

        priority_raw = self.hybrid_model.predict([kecamatan_id, scaled_features], verbose=0)[0][0]
        priority_score = float(priority_raw)
        priority_score_pct = float(priority_raw * 100.0)

        return {
            "kecamatan": normalized_kecamatan,
            "predicted_label": predicted_label,
            "predicted_class": predicted_class,
            "risk_score_pct": round(risk_score_pct, 4),
            "confidence_score": round(confidence_score, 6),
            "priority_score": round(priority_score, 6),
            "priority_score_pct": round(priority_score_pct, 4),
            "probabilities": {
                "rendah": round(float(risk_probs[0]), 6),
                "sedang": round(float(risk_probs[1]), 6),
                "tinggi": round(float(risk_probs[2]), 6),
            },
            "recommendation": self.make_recommendation(predicted_label, priority_score_pct, payload),
            "model_version": self.model_version,
        }

    def predict_batch(self, records: List[RiskPredictionInput]):
        return [self.predict_one(record) for record in records]


model_service = PintarinModelService()