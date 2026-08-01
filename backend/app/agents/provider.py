import abc
from typing import Dict, Any, List

class BaseLLMProvider(abc.ABC):
    """Abstract interface for LLM providers (OpenAI, Ollama, Mock)."""
    
    @abc.abstractmethod
    def generate_summary(self, user_id: str, transaction: Dict[str, Any], history: List[Dict[str, Any]], risk_score: float) -> str:
        pass


class MockLLMProvider(BaseLLMProvider):
    """Rule-based mock provider fallback for zero external dependency execution."""
    def generate_summary(self, user_id: str, transaction: Dict[str, Any], history: List[Dict[str, Any]], risk_score: float) -> str:
        amount = transaction.get("amount", 0)
        category = transaction.get("merchant_category", "unknown")
        device = transaction.get("device_id", "unknown")
        
        hist_count = len(history)
        avg_hist_amount = sum(h.get("amount", 0) for h in history) / max(hist_count, 1) if history else 0
        multiplier = round(amount / max(avg_hist_amount, 1), 1) if avg_hist_amount > 0 else 3.5

        return (
            f"ALERT SUMMARY: High Risk Transaction Detected (Risk Score: {risk_score:.2f}). "
            f"User {user_id} placed an unusual order of ${amount:.2f} in category '{category}' using device '{device}'. "
            f"This represents ~{multiplier}x their normal historical spend velocity (past 24h avg: ${avg_hist_amount:.2f} across {hist_count} txns). "
            f"Recommendation: Block transaction and request 2FA verification."
        )


class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    def generate_summary(self, user_id: str, transaction: Dict[str, Any], history: List[Dict[str, Any]], risk_score: float) -> str:
        try:
            import openai
            client = openai.OpenAI(api_key=self.api_key)
            prompt = f"Analyze this fraudulent transaction for user {user_id}. Txn: {transaction}. History: {history}. Risk score: {risk_score}."
            res = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are FraudGuard AI Agent, an expert financial fraud investigator."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150
            )
            return res.choices[0].message.content
        except Exception as e:
            # Fallback to mock on error
            return MockLLMProvider().generate_summary(user_id, transaction, history, risk_score) + f" [OpenAI API Fallback: {str(e)}]"


class OllamaProvider(BaseLLMProvider):
    def __init__(self, host: str):
        self.host = host

    def generate_summary(self, user_id: str, transaction: Dict[str, Any], history: List[Dict[str, Any]], risk_score: float) -> str:
        try:
            import requests
            prompt = f"Analyze this fraudulent transaction for user {user_id}. Txn: {transaction}. History: {history}. Risk score: {risk_score}."
            resp = requests.post(f"{self.host}/api/generate", json={
                "model": "llama2",
                "prompt": prompt,
                "stream": False
            }, timeout=5)
            if resp.status_code == 200:
                return resp.json().get("response", "")
        except Exception:
            pass
        return MockLLMProvider().generate_summary(user_id, transaction, history, risk_score)
