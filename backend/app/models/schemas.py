from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class TransactionRequest(BaseModel):
    transaction_id: str = Field(..., example="tx_987654321")
    user_id: str = Field(..., example="usr_102")
    amount: float = Field(..., gt=0, example=450.00)
    merchant_id: str = Field(..., example="merch_electro")
    merchant_category: str = Field(..., example="electronics")
    device_id: str = Field(..., example="dev_macbook_01")
    location: str = Field(..., example="New York, US")
    ip_address: Optional[str] = Field("192.168.1.1", example="192.168.1.1")
    timestamp: Optional[str] = Field(None, example="2026-08-02T01:00:00Z")

class TransactionResponse(BaseModel):
    transaction_id: str
    user_id: str
    amount: float
    fraud_probability: float
    risk_tier: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    flagged: bool
    features_used: Dict[str, Any]
    investigation_summary: Optional[str] = None
    processed_at: str

class AlertResponse(BaseModel):
    alert_id: str
    transaction_id: str
    risk_score: float
    timestamp: float
    payload: Dict[str, Any]

class ModelMetricsResponse(BaseModel):
    model_version: str
    accuracy: float
    roc_auc: float
    precision: float
    recall: float
    f1_score: float
    total_predictions: int
    cache_hit_ratio: float
