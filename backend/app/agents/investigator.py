from typing import Dict, Any, List
from app.agents.provider import BaseLLMProvider, MockLLMProvider, OpenAIProvider, OllamaProvider
from app.core.config import settings

class FraudInvestigatorAgent:
    """
    LangGraph / LLM Agent Workflow ("Investigator").
    Pulls recent user transaction history and generates a plain-English explanation summary.
    """
    def __init__(self, provider: BaseLLMProvider = None):
        if provider:
            self.provider = provider
        else:
            if settings.LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
                self.provider = OpenAIProvider(settings.OPENAI_API_KEY)
            elif settings.LLM_PROVIDER == "ollama":
                self.provider = OllamaProvider(settings.OLLAMA_HOST)
            else:
                self.provider = MockLLMProvider()

    def investigate(self, user_id: str, current_txn: Dict[str, Any], history: List[Dict[str, Any]], risk_score: float) -> str:
        """Execute agent workflow to draft summary."""
        return self.provider.generate_summary(user_id, current_txn, history, risk_score)
