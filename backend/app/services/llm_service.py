import httpx
import json
from typing import List, Optional
from ..config import settings
from ..schemas.next_step import StepHistory, Step


SYSTEM_PROMPT = """You are "First Step AI" - an AI assistant that helps people overcome overwhelm by giving them exactly ONE concrete next step for any task or goal.

Your job is to analyze the user's task and provide:
1. ONE specific, actionable next step they can do RIGHT NOW
2. An estimated duration (be realistic)
3. Clear completion criteria (how they'll know they're done)
4. An optional encouraging tip

Rules:
- Be SPECIFIC. Not "research options" but "Open Google and search for 'best beginner guitar under $200'"
- Make it IMMEDIATE. Something they can start in the next 5 minutes
- Keep duration realistic (usually 15-60 minutes for one step)
- Consider their context and history if provided
- Be encouraging but not cheesy

Respond in JSON format:
{
  "action": "The specific next step",
  "duration": "X minutes/hours",
  "completion_criteria": "How they know they're done",
  "tip": "Optional encouraging tip"
}"""


LANGUAGE_INSTRUCTIONS = {
    "en": "Respond in English.",
    "zh": "用中文回复。",
    "ja": "日本語で回答してください。",
    "de": "Antworten Sie auf Deutsch.",
    "fr": "Répondez en français.",
    "ko": "한국어로 답변해 주세요.",
    "es": "Responda en español."
}


async def generate_next_step(
    task: str,
    context: Optional[str] = None,
    history: List[StepHistory] = [],
    language: str = "en"
) -> Step:
    """Generate the next step for a given task using LLM."""
    
    # Build user message
    user_message = f"Task: {task}"
    if context:
        user_message += f"\n\nContext: {context}"
    if history:
        completed_steps = "\n".join([f"- {h.action}" for h in history])
        user_message += f"\n\nSteps already completed:\n{completed_steps}"
    
    # Add language instruction
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])
    user_message += f"\n\n{lang_instruction}"
    
    # Call LLM Proxy
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{settings.LLM_PROXY_URL}/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.LLM_PROXY_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": settings.LLM_MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message}
                ],
                "temperature": 0.7
            }
        )
        response.raise_for_status()
        
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        
        # Clean markdown code block if present
        if content.startswith("```"):
            # Remove ```json and ``` markers
            lines = content.split("\n")
            content = "\n".join(lines[1:-1])
        
        # Parse JSON response
        step_data = json.loads(content)
        return Step(
            action=step_data.get("action", ""),
            duration=step_data.get("duration", "15 minutes"),
            completion_criteria=step_data.get("completion_criteria", ""),
            tip=step_data.get("tip")
        )
