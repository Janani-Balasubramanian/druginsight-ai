"""SHAP-based explainability for repurposing predictions."""

from __future__ import annotations

import numpy as np

from app.ml.model import FEATURE_COLUMNS, get_model
from app.models.schemas import FeatureContribution

DISPLAY_NAMES = {
    "molecular_weight": "Molecular Weight",
    "logp": "Lipophilicity (LogP)",
    "hbd": "Hydrogen Bond Donors",
    "hba": "Hydrogen Bond Acceptors",
    "tpsa": "Topological Polar Surface Area",
    "activity": "Drug Activity",
}


def explain_prediction(drug: str, disease: str, feature_vector: list[float] | None = None) -> dict:
    model_bundle = get_model()
    model = model_bundle.model
    scaler = model_bundle.scaler
    feature_names = model_bundle.feature_names

    if feature_vector is None:
        result = model_bundle.predict(drug, disease)
        feature_vector = result["feature_vector"]

    X = np.array([feature_vector], dtype=float)
    if scaler is not None:
        X_scaled = scaler.transform(X)
    else:
        X_scaled = X

    contributions: list[FeatureContribution] = []

    if model is not None and not model_bundle.metrics.get("is_demo"):
        try:
            import shap

            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(X_scaled)
            if isinstance(shap_values, list):
                values = shap_values[1][0]
            else:
                values = shap_values[0]
            for name, val in zip(feature_names, values):
                contributions.append(
                    FeatureContribution(
                        feature=DISPLAY_NAMES.get(name, name),
                        contribution=round(float(val), 4),
                    )
                )
        except Exception:
            contributions = _fallback_importance(model, X_scaled, feature_names)
    else:
        # Feature importance from trained forest or uniform weights for demo
        if model is not None and hasattr(model, "feature_importances_"):
            contributions = _fallback_importance(model, X_scaled, feature_names)
        else:
            weights = np.abs(X[0])
            weights = weights / (weights.sum() or 1)
            for name, w in zip(feature_names, weights):
                contributions.append(
                    FeatureContribution(
                        feature=DISPLAY_NAMES.get(name, name),
                        contribution=round(float(w), 4),
                    )
                )

    contributions.sort(key=lambda c: abs(c.contribution), reverse=True)
    top = contributions[:4]
    summary = _build_summary(top)
    return {"features": top, "summary": summary, "all_features": contributions}


def _fallback_importance(model, X_scaled, feature_names: list[str]) -> list[FeatureContribution]:
    importances = model.feature_importances_
    scaled = importances * np.abs(X_scaled[0])
    total = scaled.sum() or 1
    return [
        FeatureContribution(
            feature=DISPLAY_NAMES.get(name, name),
            contribution=round(float(val / total), 4),
        )
        for name, val in zip(feature_names, scaled)
    ]


def _build_summary(top: list[FeatureContribution]) -> str:
    if not top:
        return "Insufficient feature data for explanation."
    names = [f.feature.lower() for f in top[:2]]
    return (
        f"The model's prediction was mainly influenced by {names[0]}"
        + (f" and {names[1]}" if len(names) > 1 else "")
        + " features. This is a computational explanation, not clinical evidence."
    )
