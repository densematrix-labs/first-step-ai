from pydantic import BaseModel
from typing import Optional, List


class StepHistory(BaseModel):
    action: str
    completed: bool = True


class NextStepRequest(BaseModel):
    task: str
    context: Optional[str] = None
    history: List[StepHistory] = []
    language: str = "en"


class Step(BaseModel):
    action: str
    duration: str
    completion_criteria: str
    tip: Optional[str] = None


class NextStepResponse(BaseModel):
    step: Step
    tokens_used: int = 1
    remaining_tokens: int = 0
    is_free_trial: bool = False
