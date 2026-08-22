from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from app.explainability.shap_explainer import explain_prediction
from app.ml.model import get_model
from app.models.schemas import (
    CompareRequest,
    ExplainRequest,
    FeatureContribution,
    HistoryItem,
    ModelMetrics,
    PredictRequest,
    PredictResponse,
    RepurposeRequest,
)
from app.database.mongodb import get_db
from app.services.auth import get_current_user
from app.services.disease import search_disease
from app.services.pubchem import search_drug

router = APIRouter(prefix="/api", tags=["api"])


@router.get("/drugs/search")
async def drugs_search(q: str = Query(min_length=1)):
    return await search_drug(q)


@router.get("/diseases/search")
async def diseases_search(q: str = Query(min_length=1)):
    return await search_disease(q)


@router.post("/predict", response_model=PredictResponse)
async def predict(payload: PredictRequest, user=Depends(get_current_user)):
    model = get_model()
    result = model.predict(payload.drug, payload.disease)
    explanation = explain_prediction(payload.drug, payload.disease, result["feature_vector"])
    await _save_prediction(user, payload.drug, payload.disease, result, explanation["summary"])
    return PredictResponse(
        prediction=result["prediction"],
        score=result["score"],
        confidence=result["confidence"],
        target=result["target"],
        features=explanation["features"],
        is_demo=result["is_demo"],
    )


@router.post("/repurpose", response_model=PredictResponse)
async def repurpose(payload: RepurposeRequest, user=Depends(get_current_user)):
    drug = payload.drug or "Unknown candidate"
    model = get_model()
    result = model.predict(drug, payload.disease)
    explanation = explain_prediction(drug, payload.disease, result["feature_vector"])
    await _save_prediction(user, drug, payload.disease, result, explanation["summary"])
    return PredictResponse(
        prediction=result["prediction"],
        score=result["score"],
        confidence=result["confidence"],
        target=result["target"],
        features=explanation["features"],
        is_demo=result["is_demo"],
    )


@router.post("/explain")
async def explain(payload: ExplainRequest, user=Depends(get_current_user)):
    model = get_model()
    result = model.predict(payload.drug, payload.disease)
    vector = payload.features or result["feature_vector"]
    return explain_prediction(payload.drug, payload.disease, vector)


@router.post("/compare")
async def compare(payload: CompareRequest, user=Depends(get_current_user)):
    model = get_model()
    disease = payload.disease or "General"
    results = []
    for drug in payload.drugs:
        pred = model.predict(drug, disease)
        expl = explain_prediction(drug, disease, pred["feature_vector"])
        drug_info = await search_drug(drug)
        results.append({
            "drug": drug,
            "score": pred["score"],
            "confidence": pred["confidence"],
            "target_count": len(drug_info.targets),
            "molecular_weight": drug_info.molecular_weight,
            "top_features": [f.model_dump() for f in expl["features"][:3]],
            "is_demo": pred["is_demo"],
        })
    best = max(results, key=lambda r: r["score"])
    return {
        "comparisons": results,
        "highest_model_score": best["drug"],
        "disclaimer": "Highest model score — not a clinical recommendation.",
    }


@router.get("/history", response_model=list[HistoryItem])
async def history(user=Depends(get_current_user)):
    db = get_db()
    cursor = db.predictions.find({"userId": str(user["_id"])}).sort("createdAt", -1)
    items = []
    async for doc in cursor:
        items.append(
            HistoryItem(
                id=str(doc["_id"]),
                drug=doc["drug"],
                disease=doc["disease"],
                prediction=doc["prediction"],
                score=doc["score"],
                confidence=doc["confidence"],
                target=doc.get("target", ""),
                status=doc.get("status", "completed"),
                created_at=doc["createdAt"],
            )
        )
    return items


@router.delete("/history/{item_id}")
async def delete_history(item_id: str, user=Depends(get_current_user)):
    db = get_db()
    result = await db.predictions.delete_one(
        {"_id": ObjectId(item_id), "userId": str(user["_id"])}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="History item not found")
    return {"message": "Deleted"}


@router.get("/model/metrics", response_model=ModelMetrics)
async def model_metrics():
    model = get_model()
    m = model.get_metrics()
    if not m.get("trained"):
        return ModelMetrics(trained=False, message=m.get("message"))
    return ModelMetrics(
        trained=True,
        accuracy=m.get("accuracy"),
        precision=m.get("precision"),
        recall=m.get("recall"),
        f1_score=m.get("f1_score"),
        roc_auc=m.get("roc_auc"),
    )


async def _save_prediction(user, drug: str, disease: str, result: dict, explanation: str):
    db = get_db()
    await db.predictions.insert_one({
        "userId": str(user["_id"]),
        "drug": drug,
        "disease": disease,
        "prediction": result["prediction"],
        "score": result["score"],
        "confidence": result["confidence"],
        "target": result["target"],
        "explanation": explanation,
        "status": "completed",
        "createdAt": datetime.now(timezone.utc),
    })
