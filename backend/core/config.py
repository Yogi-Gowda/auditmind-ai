import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./auditmind.db")

# OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
AI_MODE = os.getenv("AI_MODE", "mock")  # "mock" or "openai"

# App
APP_TITLE = "AuditMind AI"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = "Automated Compliance Evidence Collection & Audit Intelligence"

# Evidence Freshness Thresholds (days)
FRESHNESS_GREEN = 30
FRESHNESS_YELLOW = 90

# Confidence Thresholds
CONFIDENCE_LOW = 0.70
CONFIDENCE_HIGH = 0.90

# Risk Score Weights
RISK_WEIGHT_MISSING = 0.40
RISK_WEIGHT_STALE = 0.30
RISK_WEIGHT_CONFIDENCE = 0.20
RISK_WEIGHT_REVIEW = 0.10
