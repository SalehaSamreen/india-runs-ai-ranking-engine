"""
Normalization helpers.
Pure functions — no scoring, no AI logic.
"""

import re
from typing import Optional

# ---------------------------------------------------------------------------
# Skill name normalization
# ---------------------------------------------------------------------------

_SKILL_ALIASES: dict[str, str] = {
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "scikit-learn": "scikit-learn",
    "sklearn": "scikit-learn",
    "scikit learn": "scikit-learn",
    "nlp": "NLP",
    "llm": "LLM",
    "llms": "LLM",
    "langchain": "LangChain",
    "openai": "OpenAI",
    "faiss": "FAISS",
    "rag": "RAG",
    "gcp": "GCP",
    "aws": "AWS",
    "sql": "SQL",
    "nosql": "NoSQL",
    "pyspark": "PySpark",
    "lora": "LoRA",
    "qlora": "QLoRA",
    "gans": "GANs",
    "bert": "BERT",
    "gpt": "GPT",
    "tts": "TTS",
}


def normalize_skill_name(name: str) -> str:
    key = name.strip().lower()
    return _SKILL_ALIASES.get(key, name.strip())


# ---------------------------------------------------------------------------
# Company name normalization
# ---------------------------------------------------------------------------

_COMPANY_ALIASES: dict[str, str] = {
    "google llc": "Google",
    "google inc": "Google",
    "google inc.": "Google",
    "amazon.com": "Amazon",
    "amazon web services": "AWS",
    "meta platforms": "Meta",
    "facebook": "Meta",
    "microsoft corporation": "Microsoft",
}


def normalize_company_name(name: str) -> str:
    key = re.sub(r"\s+", " ", name.strip().lower())
    return _COMPANY_ALIASES.get(key, name.strip())


# ---------------------------------------------------------------------------
# Experience normalization
# ---------------------------------------------------------------------------

def months_to_years(months: int) -> float:
    return round(months / 12, 2)


def parse_experience_string(text: str) -> Optional[float]:
    """
    Convert strings like '3 years 8 months' or '5 yrs' to float years.
    Returns None if parsing fails.
    """
    text = text.lower().strip()
    years = 0.0
    months = 0.0

    y_match = re.search(r"(\d+(?:\.\d+)?)\s*y(?:ear|r)", text)
    m_match = re.search(r"(\d+)\s*m(?:onth|o)", text)

    if y_match:
        years = float(y_match.group(1))
    if m_match:
        months = float(m_match.group(1))

    if not y_match and not m_match:
        return None

    return round(years + months / 12, 2)


# ---------------------------------------------------------------------------
# Text cleaning
# ---------------------------------------------------------------------------

def clean_text(text: Optional[str]) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()
