import math
from typing import Dict, Any, List
from app.core.lru_cache import LRUCache
from app.core.config import settings

class FeatureStoreService:
    """
    Feature Store Service utilizing custom hand-rolled LRU Cache for O(1) in-memory retrieval.
    Computes/retrieves rolling window features (24h/7d transaction velocity, amount z-scores).
    """
    def __init__(self):
        self.cache = LRUCache(capacity=settings.LRU_CACHE_CAPACITY)
        self.user_history: Dict[str, List[Dict[str, Any]]] = {}
        self.hits = 0
        self.misses = 0

    def get_user_features(self, user_id: str, current_amount: float, merchant_category: str) -> Dict[str, Any]:
        cache_key = f"features:{user_id}"
        cached = self.cache.get(cache_key)

        if cached is not None:
            self.hits += 1
            # Update current transaction in calculations
            hist = self.user_history.get(user_id, [])
        else:
            self.misses += 1
            hist = self.user_history.get(user_id, [])
            cached = self._compute_rolling_features(user_id, hist)
            self.cache.put(cache_key, cached)

        # Calculate amount Z-Score relative to user's history
        avg_amt = cached.get("avg_amount_24h", 50.0)
        std_amt = cached.get("std_amount_24h", 25.0)
        z_score = (current_amount - avg_amt) / max(std_amt, 1.0)

        # Merge with current transaction feature vector
        category_risk = 0.8 if merchant_category in ["crypto", "gambling", "electronics", "wire_transfer"] else 0.2

        features = {
            "amount": current_amount,
            "txn_count_24h": cached.get("txn_count_24h", 1) + 1,
            "sum_amount_24h": cached.get("sum_amount_24h", 0.0) + current_amount,
            "avg_amount_24h": avg_amt,
            "amount_z_score": round(z_score, 2),
            "merchant_category_risk": category_risk,
            "velocity_24h": cached.get("txn_count_24h", 1) + 1
        }
        return features

    def record_transaction(self, user_id: str, txn: Dict[str, Any]):
        if user_id not in self.user_history:
            self.user_history[user_id] = []
        self.user_history[user_id].append(txn)
        # Keep last 50 transactions per user
        if len(self.user_history[user_id]) > 50:
            self.user_history[user_id].pop(0)

        # Invalidate cache entry so next get re-calculates or updates
        cache_key = f"features:{user_id}"
        updated_features = self._compute_rolling_features(user_id, self.user_history[user_id])
        self.cache.put(cache_key, updated_features)

    def get_user_history(self, user_id: str) -> List[Dict[str, Any]]:
        return self.user_history.get(user_id, [])

    def _compute_rolling_features(self, user_id: str, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not history:
            return {
                "txn_count_24h": 0,
                "sum_amount_24h": 0.0,
                "avg_amount_24h": 50.0,
                "std_amount_24h": 25.0
            }

        amounts = [t.get("amount", 0.0) for t in history]
        count = len(amounts)
        total = sum(amounts)
        avg = total / count
        variance = sum((x - avg) ** 2 for x in amounts) / count if count > 1 else 625.0
        std = math.sqrt(variance)

        return {
            "txn_count_24h": count,
            "sum_amount_24h": total,
            "avg_amount_24h": round(avg, 2),
            "std_amount_24h": round(std, 2)
        }

    def get_cache_hit_ratio(self) -> float:
        total = self.hits + self.misses
        return round(self.hits / total, 4) if total > 0 else 1.0
