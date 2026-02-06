import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "First Step AI"
    TOOL_NAME: str = "first-step-ai"
    DEBUG: bool = False
    
    # LLM Proxy
    LLM_PROXY_URL: str = "https://llm-proxy.densematrix.ai"
    LLM_PROXY_KEY: str = ""
    LLM_MODEL: str = "gemini-2.0-flash"
    
    # CORS
    CORS_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
