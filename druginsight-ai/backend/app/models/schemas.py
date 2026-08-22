from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class PredictRequest(BaseModel):
    drug: str = Field(min_length=1)
    disease: str = Field(min_length=1)


class RepurposeRequest(BaseModel):
    disease: str = Field(min_length=1)
    drug: str | None = None


class ExplainRequest(BaseModel):
    drug: str
    disease: str
    features: list[float] | None = None


class CompareRequest(BaseModel):
    drugs: list[str] = Field(min_length=2, max_length=4)
    disease: str | None = None


class FeatureContribution(BaseModel):
    feature: str
    contribution: float


class PredictResponse(BaseModel):
    prediction: str
    score: float
    confidence: Literal["low", "medium", "high"]
    target: str
    features: list[FeatureContribution]
    is_demo: bool = False
    disclaimer: str = (
        "Computational prediction — not medical advice. "
        "Requires experimental validation."
    )


class DrugSearchResult(BaseModel):
    name: str
    external_id: str
    molecular_formula: str | None = None
    molecular_weight: float | None = None
    smiles: str | None = None
    targets: list[str] = []
    bioactivity: dict[str, Any] | None = None
    is_demo: bool = False


class DiseaseSearchResult(BaseModel):
    name: str
    overview: str
    associated_targets: list[str]
    potential_candidates: list[str]
    is_demo: bool = False


class HistoryItem(BaseModel):
    id: str
    drug: str
    disease: str
    prediction: str
    score: float
    confidence: str
    target: str
    status: str
    created_at: datetime


class ModelMetrics(BaseModel):
    trained: bool
    accuracy: float | None = None
    precision: float | None = None
    recall: float | None = None
    f1_score: float | None = None
    roc_auc: float | None = None
    message: str | None = None
