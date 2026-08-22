"""Random Forest baseline model for drug-disease repurposing."""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

from app.preprocessing.pipeline import (
    FEATURE_COLUMNS,
    clean_data,
    extract_features,
    load_dataset,
    split_data,
)
from app.utils.config import get_settings

MODEL_DIR = Path(__file__).resolve().parents[3] / "models"
MODEL_PATH = MODEL_DIR / "repurpose_model.joblib"
METRICS_PATH = MODEL_DIR / "metrics.json"
DATASET_PATH = Path(__file__).resolve().parents[3] / "datasets" / "drug_disease_pairs.csv"

DISEASE_TARGETS = {
    "alzheimer": "ACHE",
    "alzheimer's disease": "ACHE",
    "cardiovascular": "PTGS2",
    "cardiovascular disease": "PTGS2",
    "diabetes": "AMPK",
    "type 2 diabetes": "AMPK",
    "inflammation": "PTGS2",
    "pulmonary hypertension": "PDE5A",
}

DRUG_DEFAULTS = {
    "aspirin": {"molecular_weight": 180.16, "logp": 1.19, "hbd": 1, "hba": 4, "tpsa": 63.6, "activity": 0.55},
    "metformin": {"molecular_weight": 129.16, "logp": -1.43, "hbd": 4, "hba": 2, "tpsa": 91.5, "activity": 0.62},
    "donepezil": {"molecular_weight": 379.49, "logp": 4.27, "hbd": 0, "hba": 4, "tpsa": 42.7, "activity": 0.71},
    "ibuprofen": {"molecular_weight": 206.28, "logp": 3.97, "hbd": 1, "hba": 2, "tpsa": 37.3, "activity": 0.48},
    "sildenafil": {"molecular_weight": 474.58, "logp": 2.7, "hbd": 1, "hba": 7, "tpsa": 113.0, "activity": 0.58},
    "memantine": {"molecular_weight": 179.30, "logp": 3.31, "hbd": 2, "hba": 1, "tpsa": 26.0, "activity": 0.65},
    "galantamine": {"molecular_weight": 287.35, "logp": 1.68, "hbd": 2, "hba": 4, "tpsa": 41.5, "activity": 0.69},
}


class RepurposeModel:
    def __init__(self) -> None:
        self.model: RandomForestClassifier | None = None
        self.scaler = None
        self.feature_names = FEATURE_COLUMNS
        self.metrics: dict = {}
        self._load_or_train()

    def _load_or_train(self) -> None:
        if MODEL_PATH.exists():
            bundle = joblib.load(MODEL_PATH)
            self.model = bundle["model"]
            self.scaler = bundle["scaler"]
            self.feature_names = bundle.get("feature_names", FEATURE_COLUMNS)
            if METRICS_PATH.exists():
                self.metrics = json.loads(METRICS_PATH.read_text())
            return
        self.train()

    def train(self) -> dict:
        df = load_dataset()
        df = clean_data(df)
        X, y, scaler = extract_features(df)
        self.scaler = scaler
        X_train, X_test, y_train, y_test = split_data(X, y)
        clf = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=5)
        clf.fit(X_train, y_train)
        self.model = clf
        probs = clf.predict_proba(X_test)[:, 1]
        preds = clf.predict(X_test)
        self.metrics = {
            "trained": True,
            "accuracy": float(accuracy_score(y_test, preds)),
            "precision": float(precision_score(y_test, preds, zero_division=0)),
            "recall": float(recall_score(y_test, preds, zero_division=0)),
            "f1_score": float(f1_score(y_test, preds, zero_division=0)),
            "roc_auc": float(roc_auc_score(y_test, probs)) if len(set(y_test)) > 1 else None,
            "train_samples": int(len(y_train)),
            "test_samples": int(len(y_test)),
        }
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump(
            {"model": clf, "scaler": scaler, "feature_names": self.feature_names},
            MODEL_PATH,
        )
        METRICS_PATH.write_text(json.dumps(self.metrics, indent=2))
        return self.metrics

    def _lookup_features(self, drug: str, disease: str) -> np.ndarray:
        drug_key = drug.strip().lower()
        df = load_dataset()
        match = df[
            (df["drug"].str.lower() == drug_key)
            & (df["disease"].str.lower() == disease.strip().lower())
        ]
        if not match.empty:
            row = match.iloc[0]
            return row[self.feature_names].values.astype(float).reshape(1, -1)
        defaults = DRUG_DEFAULTS.get(drug_key, {
            "molecular_weight": 250.0, "logp": 2.0, "hbd": 2, "hba": 3, "tpsa": 60.0, "activity": 0.5
        })
        return np.array([[defaults[c] for c in self.feature_names]], dtype=float)

    def predict(self, drug: str, disease: str) -> dict:
        settings = get_settings()
        if settings.demo_mode or self.model is None:
            return self._demo_prediction(drug, disease)
        raw = self._lookup_features(drug, disease)
        X = self.scaler.transform(raw)
        prob = float(self.model.predict_proba(X)[0, 1])
        label = "potential_candidate" if prob >= 0.5 else "unlikely_candidate"
        confidence = self._confidence(prob)
        target = self._resolve_target(drug, disease)
        return {
            "prediction": label,
            "score": round(prob, 4),
            "confidence": confidence,
            "target": target,
            "feature_vector": raw[0].tolist(),
            "is_demo": False,
        }

    def _demo_prediction(self, drug: str, disease: str) -> dict:
        raw = self._lookup_features(drug, disease)
        # Deterministic demo score from feature hash — not presented as real science
        seed = hash(f"{drug.lower()}|{disease.lower()}") % 1000
        prob = 0.35 + (seed / 1000) * 0.55
        return {
            "prediction": "potential_candidate" if prob >= 0.5 else "unlikely_candidate",
            "score": round(prob, 4),
            "confidence": self._confidence(prob),
            "target": self._resolve_target(drug, disease),
            "feature_vector": raw[0].tolist(),
            "is_demo": True,
        }

    @staticmethod
    def _confidence(prob: float) -> str:
        if prob >= 0.7 or prob <= 0.3:
            return "high"
        if prob >= 0.55 or prob <= 0.45:
            return "medium"
        return "low"

    def _resolve_target(self, drug: str, disease: str) -> str:
        df = load_dataset()
        match = df[
            (df["drug"].str.lower() == drug.strip().lower())
            & (df["disease"].str.lower() == disease.strip().lower())
        ]
        if not match.empty and "target" in match.columns:
            return str(match.iloc[0]["target"])
        disease_key = disease.strip().lower()
        for key, target in DISEASE_TARGETS.items():
            if key in disease_key:
                return target
        return "Unknown target (computational)"

    def get_metrics(self) -> dict:
        if self.metrics:
            return self.metrics
        return {"trained": False, "message": "Model evaluation will appear after training."}


_model: RepurposeModel | None = None


def get_model() -> RepurposeModel:
    global _model
    if _model is None:
        _model = RepurposeModel()
    return _model
