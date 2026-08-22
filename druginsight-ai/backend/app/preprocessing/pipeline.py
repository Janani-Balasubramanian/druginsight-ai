"""Data loading and cleaning utilities for the ML pipeline."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

DATASET_PATH = Path(__file__).resolve().parents[3] / "datasets" / "drug_disease_pairs.csv"


def load_dataset(path: Path | None = None) -> pd.DataFrame:
    path = path or DATASET_PATH
    if not path.exists():
        return _seed_dataset(path)
    df = pd.read_csv(path)
    return clean_data(df)


def _seed_dataset(path: Path) -> pd.DataFrame:
    """Create a small research-style dataset for baseline training."""
    rows = [
        {"drug": "Aspirin", "disease": "Cardiovascular Disease", "target": "PTGS2", "label": 1,
         "molecular_weight": 180.16, "logp": 1.19, "hbd": 1, "hba": 4, "tpsa": 63.6, "activity": 0.82},
        {"drug": "Metformin", "disease": "Type 2 Diabetes", "target": "AMPK", "label": 1,
         "molecular_weight": 129.16, "logp": -1.43, "hbd": 4, "hba": 2, "tpsa": 91.5, "activity": 0.91},
        {"drug": "Donepezil", "disease": "Alzheimer's Disease", "target": "ACHE", "label": 1,
         "molecular_weight": 379.49, "logp": 4.27, "hbd": 0, "hba": 4, "tpsa": 42.7, "activity": 0.88},
        {"drug": "Ibuprofen", "disease": "Inflammation", "target": "PTGS2", "label": 1,
         "molecular_weight": 206.28, "logp": 3.97, "hbd": 1, "hba": 2, "tpsa": 37.3, "activity": 0.79},
        {"drug": "Sildenafil", "disease": "Pulmonary Hypertension", "target": "PDE5A", "label": 1,
         "molecular_weight": 474.58, "logp": 2.7, "hbd": 1, "hba": 7, "tpsa": 113.0, "activity": 0.85},
        {"drug": "Aspirin", "disease": "Alzheimer's Disease", "target": "PTGS2", "label": 0,
         "molecular_weight": 180.16, "logp": 1.19, "hbd": 1, "hba": 4, "tpsa": 63.6, "activity": 0.35},
        {"drug": "Metformin", "disease": "Alzheimer's Disease", "target": "AMPK", "label": 0,
         "molecular_weight": 129.16, "logp": -1.43, "hbd": 4, "hba": 2, "tpsa": 91.5, "activity": 0.42},
        {"drug": "Donepezil", "disease": "Cardiovascular Disease", "target": "ACHE", "label": 0,
         "molecular_weight": 379.49, "logp": 4.27, "hbd": 0, "hba": 4, "tpsa": 42.7, "activity": 0.28},
        {"drug": "Ibuprofen", "disease": "Type 2 Diabetes", "target": "PTGS2", "label": 0,
         "molecular_weight": 206.28, "logp": 3.97, "hbd": 1, "hba": 2, "tpsa": 37.3, "activity": 0.31},
        {"drug": "Sildenafil", "disease": "Inflammation", "target": "PDE5A", "label": 0,
         "molecular_weight": 474.58, "logp": 2.7, "hbd": 1, "hba": 7, "tpsa": 113.0, "activity": 0.22},
        {"drug": "Memantine", "disease": "Alzheimer's Disease", "target": "GRIN1", "label": 1,
         "molecular_weight": 179.30, "logp": 3.31, "hbd": 2, "hba": 1, "tpsa": 26.0, "activity": 0.76},
        {"drug": "Galantamine", "disease": "Alzheimer's Disease", "target": "ACHE", "label": 1,
         "molecular_weight": 287.35, "logp": 1.68, "hbd": 2, "hba": 4, "tpsa": 41.5, "activity": 0.81},
    ]
    df = pd.DataFrame(rows)
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False)
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.drop_duplicates()
    numeric_cols = ["molecular_weight", "logp", "hbd", "hba", "tpsa", "activity", "label"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df.dropna(subset=["drug", "disease", "label"])
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
    return df


FEATURE_COLUMNS = ["molecular_weight", "logp", "hbd", "hba", "tpsa", "activity"]


def extract_features(df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray, StandardScaler]:
    X = df[FEATURE_COLUMNS].values.astype(float)
    y = df["label"].values.astype(int)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return X_scaled, y, scaler


def split_data(X: np.ndarray, y: np.ndarray, test_size: float = 0.25, random_state: int = 42):
    return train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=y)


def save_preprocessing_metadata(path: Path, feature_names: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"feature_names": feature_names}, indent=2))
